package com.farmwise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class FarmWiseApplication {

    public static void main(String[] args) {
        SpringApplication.run(FarmWiseApplication.class, args);
    }
}
