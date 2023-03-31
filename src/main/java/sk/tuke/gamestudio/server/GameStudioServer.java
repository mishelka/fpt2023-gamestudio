package sk.tuke.gamestudio.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import sk.tuke.gamestudio.common.service.*;
import sk.tuke.gamestudio.server.service.*;

@SpringBootApplication
@EntityScan(basePackages = "sk.tuke.gamestudio.common.entity")
public class GameStudioServer {
    public static void main(String[] args) {
        SpringApplication.run(GameStudioServer.class);
    }

    @Bean
    public ScoreService scoreService() {
        return new ScoreServiceJPA();
    }

    @Bean
    public CommentService commentService() {
        return new CommentServiceJPA();
    }

    @Bean
    public RatingService getRatingService() {
        return new RatingServiceJPA();
    }

    @Bean
    public WebMvcConfigurer corsConfig() {
        String[] allowDomains = new String[2];
        allowDomains[0] = "http://localhost:3000";
        allowDomains[1] = "http://localhost:8080";

        System.out.println("CORS configuration....");
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**").allowedOrigins(allowDomains);
            }
        };
    }
}
