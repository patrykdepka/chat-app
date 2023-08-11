package pl.patrykdepka.chatapp.user;

import lombok.Data;

@Data
public class AppUser {
    private final String sessionId;
    private final String username;

    public AppUser(String sessionId, String username) {
        this.sessionId = sessionId;
        this.username = username;
    }
}
