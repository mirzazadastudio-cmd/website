# Recovery email template

In the existing project wjynujdjmtgpzzllnwgf, open Authentication > Emails > Reset password. Set subject to "Mirzazada Studio — təsdiq kodu" and paste recovery.html as the body; save. This repository file is a template artifact, not an automatically applied hosted Auth setting.

Site URL and exact redirect allow-list entry: https://mirzazadastudio.com/admin/

The UI uses resetPasswordForEmail then verifyOtp(type: recovery), getUser and updateUser. It does not create users, grant admin roles or use a secret API key. Only the password owner can enter the emailed code. The recovery link remains supported. Normal site navigation is unchanged. SMTP limits still apply. Configure custom SMTP for production email delivery.
