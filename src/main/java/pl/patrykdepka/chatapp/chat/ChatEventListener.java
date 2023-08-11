package pl.patrykdepka.chatapp.chat;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.support.GenericMessage;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import pl.patrykdepka.chatapp.user.AppUser;
import pl.patrykdepka.chatapp.user.AppUserRepository;

import java.util.List;

@Component
public class ChatEventListener {
    private static final Log logger = LogFactory.getLog(ChatEventListener.class);
    private final AppUserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatEventListener(AppUserRepository userRepository, SimpMessagingTemplate messagingTemplate) {
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleWebSocketConnectedListener(SessionConnectedEvent sessionConnectedEvent) {
        MessageHeaderAccessor headerAccessor = MessageHeaderAccessor.getAccessor(sessionConnectedEvent.getMessage());
        String sessionId = getSessionId(headerAccessor);
        String username = getUsername(headerAccessor);
        userRepository.addUser(new AppUser(sessionId, username));
        messagingTemplate.convertAndSend("/topic/public.addUser", new AppUser(sessionId, username));
        logger.info(username + " has joined [Session ID: " + sessionId + "]");
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent sessionDisconnectEvent) {
        MessageHeaderAccessor headerAccessor = MessageHeaderAccessor.getAccessor(sessionDisconnectEvent.getMessage());
        String sessionId = getSessionId(headerAccessor);
        String username = userRepository.removeUser(sessionId);
        ChatMessage serverMessage = new ChatMessage();
        serverMessage.setSender("Server");
        serverMessage.setContent(username + " has left!");
        serverMessage.setType(ChatMessageType.LEFT);
        messagingTemplate.convertAndSend("/topic/public", serverMessage);
        messagingTemplate.convertAndSend("/topic/public.deleteUser", sessionId);
        logger.info(username + " has left [Session ID: " + sessionId + "]");
    }

    private String getSessionId(MessageHeaderAccessor headerAccessor) {
        return (String) headerAccessor.getHeader(SimpMessageHeaderAccessor.SESSION_ID_HEADER);
    }

    private String getUsername(MessageHeaderAccessor headerAccessor) {
        GenericMessage<?> simpConnectMessage = (GenericMessage<?>) headerAccessor.getHeader(SimpMessageHeaderAccessor.CONNECT_MESSAGE_HEADER);
        String username = "";
        if (simpConnectMessage != null) {
            SimpMessageHeaderAccessor headerAccessor2 = SimpMessageHeaderAccessor.wrap(simpConnectMessage);
            List<String> usernameHeader = headerAccessor2.getNativeHeader("username");
            username = usernameHeader.stream().findFirst().orElseThrow();
        }

        return username;
    }
}
