const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "jjian@umich.edu",
        subject: "Thanks for joining!",
        text: `Welcome to the app, ${name}. Let me know how you like it.`    
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "jjian@umich.edu",
        subject: "Sad to see you go!",
        text: `Thanks for trying our app, ${name}. Please let us know why you left.`    
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}