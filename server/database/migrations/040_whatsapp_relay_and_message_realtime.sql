-- Privacy-protected WhatsApp delivery bindings and message Realtime support.

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS delivery_channel VARCHAR(20) NOT NULL DEFAULT 'web',
  ADD COLUMN IF NOT EXISTS external_message_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS external_sender_phone VARCHAR(20);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'messages_delivery_channel_check'
  ) THEN
    ALTER TABLE public.messages
      ADD CONSTRAINT messages_delivery_channel_check
      CHECK (delivery_channel IN ('web', 'whatsapp'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_external_message_id
  ON public.messages(external_message_id)
  WHERE external_message_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.whatsapp_relay_threads (
  conversation_id UUID PRIMARY KEY REFERENCES public.conversations(id) ON DELETE CASCADE,
  farmer_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  normalized_phone VARCHAR(20) NOT NULL,
  last_outbound_message_id VARCHAR(255),
  last_outbound_at TIMESTAMPTZ,
  last_inbound_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_relay_phone_recent
  ON public.whatsapp_relay_threads(normalized_phone, last_outbound_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_relay_outbound_message
  ON public.whatsapp_relay_threads(last_outbound_message_id)
  WHERE last_outbound_message_id IS NOT NULL;

ALTER TABLE public.whatsapp_relay_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_relay_threads FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.whatsapp_relay_threads FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TABLE public.whatsapp_relay_threads IS
  'Server-only mapping used to route private WhatsApp replies back to AgriculNet conversations.';
COMMENT ON COLUMN public.messages.external_sender_phone IS
  'Server-only normalized relay metadata. Never include this field in public message DTOs.';
