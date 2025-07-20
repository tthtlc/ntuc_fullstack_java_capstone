@Bean
public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
    authProvider.setUserDetailsService(userDetailsService);
    authProvider.setPasswordEncoder(passwordEncoder);
    return authProvider;
}

@Bean
public UserDetailsService userDetailsService(MemberRepository repository) {
    return username -> repository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
}
