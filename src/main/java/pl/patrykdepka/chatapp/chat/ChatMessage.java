package pl.patrykdepka.chatapp.chat;

import lombok.Data;

@Data
public class ChatMessage {
    private String id;
    private String sessionId;
    private ChatMessageType type;
    private String date;
    private String sender;
    private String content;
}
