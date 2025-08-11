package com.example.demo;

import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}
}

//	@Bean
//	CommandLineRunner init(UserRepository userRepository, PasswordEncoder passwordEncoder) {
//		return args -> {
//			if (userRepository.findAll().isEmpty()) {
//				userRepository.save(new User(
//						"admin",
//						"admin@example.com",
//						passwordEncoder.encode("admin123"),
//						Role.ADMINISTRATOR
//				));
//				userRepository.save(new User(
//						"client",
//						"client@example.com",
//						passwordEncoder.encode("client123"),
//						Role.KLIENT
//				));
//				// jeśli chcesz pracownika:
//				userRepository.save(new User(
//						"staff",
//						"staff@example.com",
//						passwordEncoder.encode("staff123"),
//						Role.PRACOWNIK
//				));
//			}
//		};
//	}
//}
