package tn.isi.gestionformation.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.url}")
    private String appUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendVerificationEmail(String toEmail, String login, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("✅ Vérification de votre compte — Excellent Training");

            String verifyUrl = appUrl + "/verify-email?token=" + token;

            String html = """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"></head>
                <body style="font-family:'Segoe UI',Arial,sans-serif;background:#050d1f;margin:0;padding:40px 20px;">
                  <div style="max-width:580px;margin:0 auto;background:rgba(9,20,40,0.95);border:1px solid rgba(0,180,216,0.3);border-radius:16px;overflow:hidden;">
                    <div style="background:linear-gradient(135deg,#00b4d8,#0077b6);padding:32px;text-align:center;">
                      <h1 style="color:#fff;margin:0;font-size:1.6rem;letter-spacing:1px;">🎓 Excellent Training</h1>
                    </div>
                    <div style="padding:36px 40px;">
                      <h2 style="color:#e8f1f2;font-size:1.3rem;margin-bottom:12px;">Bienvenue, <span style="color:#00e5ff;">%s</span> !</h2>
                      <p style="color:#8899aa;line-height:1.8;margin-bottom:28px;">
                        Votre compte a été créé avec succès. Pour l'activer et accéder à la plateforme,
                        veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.
                      </p>
                      <div style="text-align:center;margin:32px 0;">
                        <a href="%s"
                           style="background:linear-gradient(135deg,#00b4d8,#0077b6);color:#fff;text-decoration:none;
                                  padding:14px 36px;border-radius:12px;font-weight:700;font-size:1rem;letter-spacing:.5px;
                                  display:inline-block;box-shadow:0 4px 20px rgba(0,180,216,.4);">
                          ✅ Vérifier mon email
                        </a>
                      </div>
                      <p style="color:#556677;font-size:.82rem;text-align:center;margin-top:24px;">
                        Ce lien expire dans 24 heures. Si vous n'avez pas créé ce compte, ignorez cet email.
                      </p>
                      <hr style="border:1px solid rgba(255,255,255,.06);margin:24px 0;">
                      <p style="color:#556677;font-size:.78rem;text-align:center;">
                        Institut Supérieur d'Informatique — Université de Tunis El Manar<br>
                        Gestion de Formation · 2026
                      </p>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(login, verifyUrl);

            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Erreur envoi email: " + e.getMessage());
        }
    }
}
