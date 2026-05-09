using System.Net.Mail;
using System.Net;
using EMS.Data;

namespace EMS.Services
{
    public class EmailService
    {
        private readonly EMSDbContext _context;
        private readonly IConfiguration _configuration;

        public EmailService(EMSDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public string SendEmail(string to, string subject, string body)
        {
            string senderEmail = _configuration["EmailSettings:Email"];
            string senderPassword = _configuration["EmailSettings:Password"];
            string smtpServer = _configuration["EmailSettings:Host"];
            int smtpPort = _configuration.GetValue<int>("EmailSettings:Port");

            var smtpClient = new SmtpClient(smtpServer)
            {
                Port = smtpPort,
                Credentials = new NetworkCredential(senderEmail, senderPassword),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail),
                Subject = subject,
                Body = body,
                IsBodyHtml = true,
            };

            mailMessage.To.Add(to);
            try
            {
                smtpClient.Send(mailMessage);
                return ("email sent");
            }
            catch (Exception ex)
            {
                //_logger.LogError($"{ex}", $"{ex.Message}", "EmailService");
                return (ex.Message);
            }
        }

        public string SendLoginCredentialEmail(string to, string subject,string UserName,string Password)
        {
            string senderEmail = _configuration["EmailSettings:Email"];
            string senderPassword = _configuration["EmailSettings:Password"];
            string smtpServer = _configuration["EmailSettings:Host"];
            int smtpPort = _configuration.GetValue<int>("EmailSettings:Port");

            var smtpClient = new SmtpClient(smtpServer)
            {
                Port = smtpPort,
                Credentials = new NetworkCredential(senderEmail, senderPassword),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail),
                Subject = subject,
                Body = $@"
<body marginheight='0' topmargin='0' marginwidth='0' style='margin: 0px; background-color: #f2f3f8;' leftmargin='0'>
  <table cellspacing='0' border='0' cellpadding='0' width='100%' bgcolor='#f2f3f8' style='font-family: Open Sans, sans-serif;'>
    <tr>
      <td>
        <table style='background-color: #f2f3f8; max-width:670px; margin:0 auto;' width='100%' border='0' align='center' cellpadding='0' cellspacing='0'>
          <tr><td style='height:80px;'>&nbsp;</td></tr>
          <tr><td style='height:20px;'>&nbsp;</td></tr>
          <tr>
            <td>
              <table width='95%' border='0' align='center' cellpadding='0' cellspacing='0' style='max-width:670px; background:#fff; border-radius:3px; text-align:center; box-shadow:0 6px 18px 0 rgba(0,0,0,.06);'>
                <tr><td style='height:40px;'>&nbsp;</td></tr>
                <tr>
                  <td style='padding:0 35px;'>
                    <h1 style='color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:Rubik,sans-serif;'>Welcome to EMS</h1>
                    <p style='font-size:15px; color:#455056; margin:8px 0 0; line-height:24px;'>
                      Your account has been created on our Employee Management System. <br />
                      Below are your system generated credentials, <br/>
                      <strong>Please change the password immediately after login</strong>.
                    </p>
                    <span style='display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;'></span>
                    <p style='color:#455056; font-size:18px;line-height:20px; margin:0; font-weight:500;'>
                      <strong style='display: block;font-size: 13px; margin: 0 0 4px; color:rgba(0,0,0,.64); font-weight:normal;'>Username</strong>{UserName}
                      <strong style='display: block; font-size: 13px; margin: 24px 0 4px 0; font-weight:normal; color:rgba(0,0,0,.64);'>Password</strong>{Password}
                    </p>
                    <a href='https://yourdomain.com/login' style='background:#20e277; text-decoration:none !important; display:inline-block; font-weight:500; margin-top:24px; color:#fff; text-transform:uppercase; font-size:14px; padding:10px 24px; border-radius:50px;'>Login to your Account</a>
                  </td>
                </tr>
                <tr><td style='height:40px;'>&nbsp;</td></tr>
              </table>
            </td>
          </tr>
          <tr><td style='height:20px;'>&nbsp;</td></tr>
          <tr>
            <td style='text-align:center;'>
              <p style='font-size:14px; color:rgba(69, 80, 86, 0.74); line-height:18px; margin:0;'>&copy; <strong>https://chandrakala.co.in/</strong></p>
            </td>
          </tr>
          <tr><td style='height:80px;'>&nbsp;</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>",
                IsBodyHtml = true,
            };

            mailMessage.To.Add(to);
            try
            {
                smtpClient.Send(mailMessage);
                return ("email sent");
            }
            catch (Exception ex)
            {
                //_logger.LogError($"{ex}", $"{ex.Message}", "EmailService");
                return (ex.Message);
            }
        }

        public string SendLoginCredentialEmail(string to, string subject, string Password)
        {
            string senderEmail = _configuration["EmailSettings:Email"];
            string senderPassword = _configuration["EmailSettings:Password"];
            string smtpServer = _configuration["EmailSettings:Host"];
            int smtpPort = _configuration.GetValue<int>("EmailSettings:Port");

            var smtpClient = new SmtpClient(smtpServer)
            {
                Port = smtpPort,
                Credentials = new NetworkCredential(senderEmail, senderPassword),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail),
                Subject = subject,
                Body = $@"
<body marginheight='0' topmargin='0' marginwidth='0' style='margin: 0px; background-color: #f2f3f8;' leftmargin='0'>
  <table cellspacing='0' border='0' cellpadding='0' width='100%' bgcolor='#f2f3f8' style='font-family: Open Sans, sans-serif;'>
    <tr>
      <td>
        <table style='background-color: #f2f3f8; max-width:670px; margin:0 auto;' width='100%' border='0' align='center' cellpadding='0' cellspacing='0'>
          <tr><td style='height:80px;'>&nbsp;</td></tr>
          <tr><td style='height:20px;'>&nbsp;</td></tr>
          <tr>
            <td>
              <table width='95%' border='0' align='center' cellpadding='0' cellspacing='0' style='max-width:670px; background:#fff; border-radius:3px; text-align:center; box-shadow:0 6px 18px 0 rgba(0,0,0,.06);'>
                <tr><td style='height:40px;'>&nbsp;</td></tr>
                <tr>
                  <td style='padding:0 35px;'>
                    <h1 style='color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:Rubik,sans-serif;'Password has been reset</h1>
                    <p style='font-size:15px; color:#455056; margin:8px 0 0; line-height:24px;'>
                      Your request for password change has been processed <br />
                      Below are your system generated credentials, <br/>
                      <strong>Please change the password immediately after login</strong>.
                    </p>
                    <span style='display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;'></span>
                    <p style='color:#455056; font-size:18px;line-height:20px; margin:0; font-weight:500;'>
                      <strong style='display: block; font-size: 13px; margin: 24px 0 4px 0; font-weight:normal; color:rgba(0,0,0,.64);'>Password</strong>{Password}
                    </p>
                    <a href='https://yourdomain.com/login' style='background:#20e277; text-decoration:none !important; display:inline-block; font-weight:500; margin-top:24px; color:#fff; text-transform:uppercase; font-size:14px; padding:10px 24px; border-radius:50px;'>Login to your Account</a>
                  </td>
                </tr>
                <tr><td style='height:40px;'>&nbsp;</td></tr>
              </table>
            </td>
          </tr>
          <tr><td style='height:20px;'>&nbsp;</td></tr>
          <tr>
            <td style='text-align:center;'>
              <p style='font-size:14px; color:rgba(69, 80, 86, 0.74); line-height:18px; margin:0;'>&copy; <strong>https://chandrakala.co.in/</strong></p>
            </td>
          </tr>
          <tr><td style='height:80px;'>&nbsp;</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>",
                IsBodyHtml = true,
            };

            mailMessage.To.Add(to);
            try
            {
                smtpClient.Send(mailMessage);
                return ("email sent");
            }
            catch (Exception ex)
            {
                //_logger.LogError($"{ex}", $"{ex.Message}", "EmailService");
                return (ex.Message);
            }
        }
    }
}
