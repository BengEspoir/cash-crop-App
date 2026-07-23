jest.mock('./chat.service', () => ({
  generateReply: jest.fn()
}));

const chatService = require('./chat.service');
const { createChatResponse } = require('./chat.controller');

describe('chat controller', () => {
  test('returns the standard success envelope', async () => {
    chatService.generateReply.mockResolvedValue('A helpful answer');
    const req = { body: { messages: [{ role: 'user', content: 'Hello' }] } };
    const json = jest.fn();
    const res = { status: jest.fn(() => ({ json })) };
    const next = jest.fn();

    await createChatResponse(req, res, next);

    expect(chatService.generateReply).toHaveBeenCalledWith(req.body.messages);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      success: true,
      message: 'AI response generated',
      data: { reply: 'A helpful answer' }
    });
    expect(next).not.toHaveBeenCalled();
  });
});
