package pl.patrykdepka.chatapp.chat;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Repository;

import java.util.LinkedList;

@Repository
public class ChatMessageRepository {
    public LinkedList<ChatMessage> messages = new LinkedList<>();
    private final SimpMessagingTemplate messagingTemplate;

    public ChatMessageRepository(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void addMessage(ChatMessage chatMessage) {
        messages.addLast(chatMessage);

        if (messages.size() == 31) {
            messagingTemplate.convertAndSend("/topic/public.deleteOldestMessage", messages.getFirst().getId());
            messages.removeFirst();
        }
    }
}
