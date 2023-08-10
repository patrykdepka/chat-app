package pl.patrykdepka.chatapp.chat;

import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedList;
import java.util.UUID;

import static org.springframework.messaging.simp.SimpMessageHeaderAccessor.SESSION_ID_HEADER;

@Controller
public class ChatController {
    private final ChatMessageRepository chatMessageRepository;

    public ChatController(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    @MessageMapping("/ws")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Header(SESSION_ID_HEADER) String sessionId, @Payload ChatMessage chatMessage) {
        chatMessage.setId(UUID.randomUUID().toString());
        chatMessage.setSessionId(sessionId);
        chatMessage.setDate(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm")));
        chatMessageRepository.addMessage(chatMessage);
        return chatMessage;
    }

    @SubscribeMapping("/topic/public.previousMessages")
    public LinkedList<ChatMessage> getPreviousMessages() {
        return chatMessageRepository.messages;
    }
}
