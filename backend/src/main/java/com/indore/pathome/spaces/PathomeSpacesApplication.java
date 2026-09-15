package com.indore.pathome.spaces;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class PathomeSpacesApplication {

    public static void main(String[] args) {
        SpringApplication.run(PathomeSpacesApplication.class, args);
    }
}
