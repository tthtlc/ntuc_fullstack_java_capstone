

package com.example.lms.dto;

import lombok.Data;

@Data
public class MemberUpdateDto {
    private String name;
    private String email;
    private String username;
    private String password;
}
