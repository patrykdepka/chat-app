package pl.patrykdepka.chatapp.user;

import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class AppUserRepository {
    public Map<String, String> onlineUsers = new HashMap<>();

    public void addUser(AppUser user) {
        onlineUsers.put(user.getSessionId(), user.getUsername());
    }

    public String removeUser(String sessionId) {
        return onlineUsers.remove(sessionId);
    }

    public List<AppUser> getAllOnlineUsers() {
        List<AppUser> users = new ArrayList<>();
        Set<Map.Entry<String, String>> entries = onlineUsers.entrySet();
        for (Map.Entry<String, String> entry : entries) {
            users.add(new AppUser(entry.getKey(), entry.getValue()));
        }

        return users;
    }
}
