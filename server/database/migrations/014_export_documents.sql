-- AgriculNet — Export Documents

CREATE TABLE IF NOT EXISTS export_documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  type            doc_type NOT NULL,
  title           VARCHAR(200) NOT NULL,
  file_url        VARCHAR(500) NOT NULL,
  
  status          VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, verified, rejected
  rejection_reason TEXT,
  
  issued_at       TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_export_docs_order_id ON export_documents(order_id);
CREATE INDEX IF NOT EXISTS idx_export_docs_type     ON export_documents(type);

DROP TRIGGER IF EXISTS export_docs_updated_at ON export_documents;
CREATE TRIGGER export_docs_updated_at
  BEFORE UPDATE ON export_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
