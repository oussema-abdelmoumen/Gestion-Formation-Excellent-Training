package tn.isi.gestionformation.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class CaptchaService {

    @Value("${recaptcha.secret}")
    private String secret;

    @Value("${recaptcha.verify.url}")
    private String verifyUrl;

    public boolean verifyCaptcha(String captchaToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("secret", secret);
            params.add("response", captchaToken);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(verifyUrl, request, String.class);
            JsonNode json = new ObjectMapper().readTree(response.getBody());
            return json.get("success").asBoolean();
        } catch (Exception e) {
            return false;
        }
    }
}
