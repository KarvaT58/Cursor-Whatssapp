Introduction

Z-API - Wings for your imagination! #
Z-API was developed by programmers for programmers , so we value simplicity and objectivity in everything we do, so enough idle talk and Let's Go!

But what is Z-API? #
You probably already know this, but let's reiterate!

Z-API is a RestFul service that provides an API that allows you to interact with your WhatsApp through a simple and intuitive API, as well as webhooks to notify you about interactions with your number.

Important
The Z-API reaffirms that it is not intended for SPAM and sending unwanted messages or any action that violates WhatsApp's terms of service.

Use the API wisely by creating features that add value to your customers and WhatsApp users.

Who can use Z-API? #
We don't have any restrictions on usage, but generally, two very different audiences use our services. They are:

Programmers with knowledge of Restful APIs. If you're not a programmer, but know someone with these skills, that's fine too :)

Users of third-party solutions that allow integration with Z-API

Okay! But what can you do with it? #
Simply put, everything you do with WhatsApp Web you can do using our service. To do so, simply scan the Z-API QR code and use our service!

Technically, how does the shipping flow work? #
To illustrate, here are the steps for sending a simple text message:

You send a message to Z-API via API;

Z-API adds it to a queue and returns the message ID;

Your instance processes the queue sending to WhatsApp;

Your delivery webhook is called when the message is processed, notifying you that it was sent or that there was a failure.

Once the recipient receives the message, the message-status Webhook is called reporting RECEIVED.

Finally, when the recipient reads the message, the messages-status is called, informing READ

Limits #
I started this thread because people often ask about the sending limits with Z-API. We have NO LIMIT on the number of messages you can send! However, it's important to understand that you're using a WhatsApp Web session, so your usage pattern must be compatible. We also recommend carefully reading WhatsApp's policies on its official page https://www.whatsapp.com/legal .

WE DO NOT STORE MESSAGES!
All messages sent to our API will be forwarded to a messaging queue and after sending they will be deleted.

Remember
Facebook has different behaviors for each version of WhatsApp, our API provides methods compatible with the WEB version.

Blocks and Bans

Is there any possibility of WhatsApp blocking my number?
YES, THE POSSIBILITY EXISTS, AND IT IS REAL.

Introduction #
Good practices! #
We created this thread to share a little of everything we've learned about best practices to avoid hassles with blocks and bans on WhatsApp.

We'd like to begin by asking you the following question: You likely receive several SMS messages daily with advertisements for stores, promotions, mobile phone companies, and so on. Now think about how many of these types of messages do you receive on WhatsApp? Probably none or very few, right? Even so, if you do receive them, WhatsApp allows you to mark them as spam and even block the contact.

WHATSAPP DOES NOT ALLOW SPAM! #
WhatsApp is very strict when it comes to sending spam, which is why we pay more attention to it than to SMS. Why do we let several SMS messages pile up and can't help but look at our phone immediately after receiving a WhatsApp message? Because we know we've received a WhatsApp message from a known contact, and we rarely receive promotions from the same person.

How many messages can I send? #
Quantity is important, yes, but it's not just about the amount sent, the TO WHOM factor is often the key point.

In our conversations, we often use the story of one of our oldest clients, who now sends promotional messages via WhatsApp to over 80,000 people daily and has never had his number blocked. When we approached him and asked how he achieved such a feat, he kindly shared the following technique:

Maturing the chip: This means using the phone number on WhatsApp normally before you start sending a lot of messages through the Z-API.
Interact via mobile or WhatsApp Web before connecting to the Z-API: This helps show WhatsApp that you are a real user and not a bot.
Have text that prompts users to respond to messages: This helps show WhatsApp that you're having real conversations with people.
Offering an option for users to stop receiving messages if they don't want to: This is important to respect users' privacy and avoid reports.
Having your profile details filled out on WhatsApp: This helps show WhatsApp that you are a legitimate user.
Scan the QR code after 24 hours of registering on WhatsApp: This helps confirm that you are a real user.
Shipping method:

First: To receive promotional messages, the recipient needs to add the company's number to their contacts and send a message saying "I want promotions." This simple action significantly reduces the risk of being blocked, because with your number in their address book and the conversation starting, the block and spam report buttons won't appear;

Second: It personalizes messages with recipient data, so that all messages are not exactly the same;

Third: Always give the recipient an option to stop receiving messages. For example: "Press 2 to stop receiving these messages." This monitors webhooks to remove numbers that no longer want to receive them from the sending list.

Summary

Avoid sending messages to people who don't have your number in their contacts;

Personalize messages with the recipient's information. If this isn't possible, use random attributes to differentiate each message;

Try to convince the recipient to interact with your number, especially if you know they don't have your number in their address book;

Provide the recipient with the option to opt out of receiving further messages and monitor webhooks to handle these interactions.

Careful
If 3% of recipients mark your message as spam your number will be banned!

Blocks and Bans (2025)

Introduction #
The discussion about WhatsApp bans involving IP addresses, ASNs, and phone numbers is complex and involves multiple variables. Over the past four years, we've conducted numerous tests with both WhatsApp Web (the QR Code generator) and the device connected to that QR Code.

What we've learned during this period is that, while IP and ASN are somewhat relevant, they aren't the primary factors determining a ban. We've already implemented an IP rotation strategy in 15-, 30-, 45-, and 60-day cycles, and this action alone hasn't had a significant impact on reducing bans.

Main Factors Influencing the Ban #
1. Global Events and Volume of Fake News #
Moments of high media coverage, such as elections, political crises, and the spread of fake news, directly impact ban rates. Whenever there's a major media event, we see a percentage increase in the number of banned accounts, regardless of IP address, ASN, or connection method. This suggests that WhatsApp intensifies moderation during these periods.

2. Message Content and Sensitive Keywords #
WhatsApp has an advanced algorithm that analyzes content patterns. Messages whose content is of exclusive interest to the sender (i.e., those that don't generate natural interactions) are subject to analysis.

Financial topics have a higher risk of being blocked, especially when they contain keywords like "boleto," "PIX," "card," and others associated with financial scams. The recurrence of these words can trigger automatic verification mechanisms, increasing the risk of restrictions.

3. Using Recent Numbers and Bulk Mailing #
New numbers sending messages to many different recipients in a short period of time are easily identified as suspicious. This behavior can be simulated directly in the WhatsApp app, without the need for APIs or external platforms. Several reports indicate that newly activated numbers are being banned quickly, even without the use of automated tools.

4. Number Recycling and Usage History #
High turnover of recycled numbers can be beneficial or detrimental, depending on the number's history. If the number has been used for suspicious activity in the past, it can be quickly banned after scanning the QR Code or with a reduced volume of messages sent.

5. Message Volume x Number of Recipients #
The most relevant factor in a ban is the number of unique recipients, not just the total number of messages sent. The more different contacts a number tries to reach in a short period of time, the greater the chance of being classified as spam.

6. Reusing Patterns in Surrogate Numbers #
A common practice after a ban is to set up a new number exactly the same as the previous one. WhatsApp can identify this, especially if the new number maintains the same name, photo, description, and messaging patterns.

To mitigate this risk, it is recommended:

✅ Change your profile picture before activating your number.
✅ Modify the description and contact name before starting use.
✅ Make small changes to the initial sending behavior to avoid repetitive patterns.
This can help prevent WhatsApp from associating the new number with the previously banned number, reducing the risk of an immediate block.

Tests and Comparison with Previous Years #
We used both the official WhatsApp API and the web version for our tests. What's surprising is that, in many cases, simply connecting a new number to the platform can result in a ban. Furthermore, there are cases where the ban occurs after just 10 messages sent to different recipients.

Compared to previous years, the ban rate remains relatively stable, but the impact is uneven across customers. Some segments are suffering more than others, and this may be directly linked to the content of the messages and the profile of the recipients.

Conclusion: What Really Matters? #
WhatsApp's algorithm is constantly changing, making it impossible to have a single, foolproof strategy for avoiding bans. In the past, it was easier to say that "passive accounts don't get banned" and that "very active accounts do," but today, that distinction is no longer so clear.

The two main factors that determine bans are:

✅ Number of different recipients a number tries to reach.
✅ Message content (keywords, context and sending pattern).
Secondary factors such as number history, IP/ASN, and connection method (Web or Official) still have an impact, but are less decisive than the above factors.

There's no 100% effective best practice for avoiding bans. WhatsApp's algorithm is increasingly dynamic, and the only viable approach is to monitor, continually adapt strategies, and work within the platform's acceptable limits.

Enabling a landline number

ntroduction #
To enable a landline number, you'll need a mobile device to host your landline number. (This option is available on WhatsApp Business.) In our step-by-step guide, we used an Android phone.

First step #
Download the WhatsApp Business app on your phone

Android

IOS

img

Second step #
WhatsApp Business will ask for authorization to access your phone's files. Select Continue to grant access. On the next screen, select your country and enter your landline number.

img

Third step #
You will receive a code, but since it is not possible to receive an SMS on a landline, wait for the countdown and choose the Call me option .

And that's it, you'll receive a call from WhatsApp Business that will tell you the activation code, then just type it in the indicated field ;)

img

Fourth step #
Be happy!

Configure the settings in the WhatsApp Business app and scan the Z-API QR Code to unleash your imagination!

Android Emulators

Introduction #
To truly ensure a smooth, high-quality service, we recommend using Android emulators whenever possible. While this isn't a requirement, it can significantly improve service quality. There are several solutions on the market, including cloud-based services designed to provide your phone's hosting service. Below, we'll list some solutions we've successfully used.

Emulators #
BlueStacks

Nox

Memu

LDPlayer

Cloud Emulator

But feel free to look for other options :)

VOIP numbers
To give it a final touch, you can also combine the emulator with a VOIP number. To learn how to activate it, read the topic Enabling a fixed number in this same session :)

Z-API vs Official API

The Differences Between Z-API and WhatsApp Business API. #
What is the best alternative for you?

An example of WhatsApp's API usage: At the beginning of its launch, WhatsApp, as one of its strategic decisions, opted to keep its API closed, quite unlike other global players in the segment. In other words, developers didn't have the opportunity to integrate their software solutions and technologies with WhatsApp.

In this scenario, we're primarily talking about companies with diverse solutions on the market, such as CRM and ERP systems, the creation of popular chat bots, and even e-commerce or retail companies offering real-time notifications of customer purchase status. During this period, many developers were also creating or researching custom gateways that could provide access to the WhatsApp API. These solutions can still be found on GitHub. The problem with using these libraries is that WhatsApp updates make the solutions outdated, and, as a rule, using these libraries would immediately ban numbers.

Over time, companies are becoming increasingly aware of how much using an API like this can facilitate and greatly leverage their business, not to mention the countless creation possibilities.

Everyone knows this market is gigantic, but let's delve deeper into the numbers. Besides being the most widely used messaging app in the world, with 1.7 billion users today, most businesses are using it. Some of the reasons why so many businesses are using it include the ability to centralize everything in a single channel, providing greater convenience, agility in managing their business in one place, closer contact, and a lot of practicality. Companies have begun to emerge in the market offering their APIs to work with WhatsApp. As a rule, they all operate based on the WhatsApp WEB protocol. And of course, Z-API also provides a WhatsApp API. We developed our solution in 2019, when we integrated with a Brazilian solution. Soon, numerous DEVs and business partners around the world also began the integration process with us.

We've always made the purpose of our solution very clear, and we've been taking it everywhere: "Z-API, Wings for your imagination." We want to empower DEVs, technology solutions, and software houses to develop extraordinary products and businesses with the best technology on the market, quality service, and a Brazilian solution that's paid in Brazilian reais and gives you the freedom to create.

In 2017, WhatsApp opened access to its official API. Initially, the official WhatsApp API was tested behind closed doors, and only a few global companies could afford it. But over time, more and more organizations gained access to the official WhatsApp API.

The order of cooperation is such that, to connect to the official API, you'll need to coordinate with official WhatsApp partners. In other words, you'll need to work with intermediaries who are designed to provide an API and moderate your activities under WhatsApp's current regulations. This entails a large number of restrictions, which will be displayed in the table below. You can check the list of current official partners here: https://www.facebook.com/business/partner-directory/search?solution_type=messaging . This is crucial because some companies are now misleading their customers by claiming to be official WhatsApp partners.

In this case, is it wise to use the Official API? Let's take a closer look. The first thing to decide is: why do you need an API? Both options have advantages and disadvantages. The WhatsApp API clearly has more notoriety, mainly due to its "officiality" and security. However, there are several significant limitations that not all companies will be able to work with the official API. We'll highlight them separately:

Disadvantages of the Official API: #
Price: The official API membership fee can range from a few hundred dollars to thousands of dollars. This doesn't include connection costs and individual message fees on WhatsApp. Furthermore, the fee price is dictated by WhatsApp itself (in local currency), so it's not always possible to arrange a more personalized approach with an intermediary. You can read more about pricing on the developer's official website: https://developers.facebook.com/docs/whatsapp/pricing#usdusd Similarly, those wishing to connect to the official API must have a minimum monthly message volume of 15,000, which isn't feasible for all companies. WhatsApp doesn't approve partnerships with certain sectors. For example, finance and real estate are attractive to WhatsApp. And, say, companies selling vitamins or medicines don't get approval from the messenger. Working with an official WhatsApp representative and obtaining the API will also require significant effort on your part. Collecting and processing documents, approving inspections, developing and approving templates—all of this can take significant time and ultimately fail. Unfortunately, this risk also exists. Cell phone dependence, General Data Protection Law, Delay in receiving updates, Number suspension and blocking

Advantages of the Official API: #
Ease and engagement: #
WhatsApp allows you to respond quickly to messages. Additionally, there's an increase in feedback and engagement from consumers;

Marketing:#
companies can send personalized messages, promotion notices, information and news;

Centralization of information: #
the app's integration with other systems includes all the information present in each of them, preventing the loss of important data;

Metrics and reports: #
Depending on which program the app is integrated with, it is possible to extract relevant data about the service on the platform (if the system with which it is integrated has this functionality);

Have you ever thought about being banned by WhatsApp? #
According to some WhatsApp statistics, the messenger blocks around 2,000,000 users per month who violate WhatsApp policy terms.

But this doesn't mean that unofficial APIs are irresponsible to their clients. For example, the Z-API for user security provides clients with individual IPs, performs secure authorization, and implements a system of artificial safeguards, such as a message queue, to prevent mass sending and protect them from bans.

There are also systems for emulating a phone on a computer so that work doesn't depend on a physical device. Of course, these methods won't help if the user disregards the rules for working with WhatsApp clients and spam. Even with the official API, it's possible to be banned for violating WhatsApp's policies. However, if you combine the Z-API's security tools with use within WhatsApp's recommendations, you can.

After reviewing the main points, you can jump straight to the most interesting part—analysis—and compare which solution best suits your needs with WhatsApp. Let's start with the benefits of Z-API:

Comparison #
Z-API	Business Api
Works with any existing personal or business number	Only works with new dedicated numbers
You can start working immediately after registering the number, but it is important to follow our recommendations	The number must work for at least 3-4 weeks before you can connect.
Available to all customer categories	Currently only available to medium and large companies
You can submit any content (without breaking the law)	Post templates must be pre-approved
Unlimited messages for a flat fee	The cost of messages can reach ~$0.07 depending on the country (same as the price of sms)
No conditions and easy registration	Strict compliance and comprehensive implementation process
Simple JSON API and Webhooks, integration in just 10 minutes, requires only a phone	Requires a dedicated server and complex system architecture, integration will take at least 2-4 weeks
Permission is not required, you can write first	Subscriber permission is required to receive messages
You can start immediately	To connect, you will have to go through a bureaucratic process, which can take at least a month.
You can use numbers in any quantity	Only one number per verified company
24/7 direct support via email and chatbot chats + our team	Limited support (paid support through solution partners)
Possibility of making any modification and integration	Inability to influence and add functionality to the service
Any name of your account	Immutable name of your account (by business name)
Can work worldwide	It is not possible to work with WhatsApp API, for example, in Crimea, Iran and several other countries
Payment in Reais	Payment in dollars
Fully Brazilian tool +5 million daily messages	American Tool, communication in English

Button Operation

Introduction #
In recent weeks, messages containing buttons have been experiencing instability in their operation.

It's important to remember that this is not a problem unique to Z-API.

This topic describes how buttons behave in WhatsApp in different scenarios.

Attention
This documentation was updated on August 27, 2024, so the facts about how the buttons work are based on the current state. It's important to remember that buttons may change with each WhatsApp update.

Decisive factors: #
For the buttons to work on WhatsApp, there are two decisive factors: #
Whether the WhatsApp sending the message is business or normal
Whether the message is being sent to a regular chat or a group chat.
Accept the terms of use of the buttons
Accept the terms of use of the buttons #
To use the button functionality, you must accept the terms of use, acknowledging that you are aware that future WhatsApp updates may cause instability in this functionality.

img

Button Types #
There are seven types of buttons in WhatsApp: #
Simple button with text (/send-button-list)
Simple button with image (/send-button-list-image)
Simple button with video (/send-button-list-video)
Option list (/send-option-list)
Action buttons (/send-button-actions)
Copy button (/send-button-otp)
PIX button (/send-button-pix)
Button behavior: #
Simple button with text: #
Sending from Normal WhatsApp to Group: IT WORKS
Sending from Normal WhatsApp to Normal Chat: IT WORKS
Sending from WhatsApp Business to Normal Chat: IT WORKS
Sending from WhatsApp Business to Group: IT WORKS
Simple button with image: #
Sending from Normal WhatsApp to Normal Chat: IT WORKS
Sending from Normal WhatsApp to Group: IT WORKS
Sending from WhatsApp Business to Normal Chat: IT WORKS
Sending from WhatsApp Business to Group: IT WORKS
Simple button with video: #
Sending from Normal WhatsApp to Normal Chat: IT WORKS
Sending from Normal WhatsApp to Group: IT WORKS
Sending from WhatsApp Business to Normal Chat: IT WORKS
Sending from WhatsApp Business to Group: IT WORKS
List of options: #
Sending from Normal WhatsApp to Normal Chat: IT WORKS
Sending from Normal WhatsApp to Group: IT WORKS
Sending from WhatsApp Business to Normal Chat: IT WORKS
Sending from WhatsApp Business to Group: IT WORKS
Action buttons: #
Sending from Normal WhatsApp to Normal Chat: IT WORKS
Sending from Normal WhatsApp to Group: IT WORKS
Sending from WhatsApp Business to Normal Chat: IT WORKS
Sending from WhatsApp Business to Group: IT WORKS
Copy button: #
Sending from Normal WhatsApp to Normal Chat: IT WORKS
Sending from Normal WhatsApp to Group: IT WORKS
Sending from WhatsApp Business to Normal Chat: IT WORKS
Sending from WhatsApp Business to Group: IT WORKS
PIX key button: #
Sending from Normal WhatsApp to Normal Chat: IT WORKS
Sending from Normal WhatsApp to Group: IT WORKS
Sending from WhatsApp Business to Normal Chat: IT WORKS
Sending from WhatsApp Business to Group: IT WORKS
Summary #
In short, using button features on WhatsApp is subject to issues. tffFor both regular WhatsApp and WhatsApp Business, there are difficulties sending these types of buttons in regular chats and groups. The list of options for regular chats works. If you're using WhatsApp Business, the only thing that works is the list of options for regular chats, which has issues with groups.

File expiration date

How it works #
What is the expiration date of z-api files?
All media files received from z-api through your webhook have a 30-day expiration period . After this period, all files, whether audio, PDF, image, etc., will be deleted from storage.

Z-API offers webhook functionality to receive texts and files directly into your application, without the need to store this information on our servers. This means your application has full control over the data received, which is especially important for complying with the requirements of the General Data Protection Law (LGPD).

If the client wishes to store all received media, it's important to implement an internal storage system within their application so they can manage this data according to their own privacy and security policies. This way, our webhook solution helps ensure the security of your client's data while simplifying the process of receiving information in your application.

To achieve this storage, the application can implement an internal storage system. This can be achieved through various technologies available on the market, such as cloud storage services, databases, and file management systems. There are several tools and services that can be used for this purpose, including:

Amazon S3
Google Cloud Storage

Postman Collection

Introduction to the Z-API Postman Collection #
To facilitate development and integration with our API, we provide a Postman collection containing all Z-API endpoints, parameters, and sample requests. This collection helps developers quickly and easily test endpoints, allowing them to explore API functionality without having to manually create requests.

Below is the link to access the Z-API Postman collection:

Link to the Postman collection

ID e Token

What is it and what is it for? #
It is not difficult to imagine that for communication between APIs we will need to establish a security protocol between the parties, that is, between the Z-API and your application, all interactions with our API will need to be authenticated by an ID and a token.

Once you have your ID and Token, you can start sending messages. To do this, you need to compose the URL with your information.

For example: https://api.z-api.io/instances/YOUR_INSTANCE/token/YOUR_TOKEN/send-text

Note that the ID and Token information make up the integration URL.

How do I get my ID and token? #
Right after you create your Z-API account, you'll need to create an instance, which will have an ID and a token to identify it. These two pieces of information together will ensure secure communication between your application and ours. To view your instance's ID and token, simply access the instance in the admin panel and click edit. There, you'll find all the instance's data. Remember that you can have multiple instances, but each one has its own ID and token.

warning
Never share your ID and token with anyone; anyone with this information can send messages on your behalf. We also recommend that calls to our API NEVER be made through the frontend, but rather through the server, to avoid exposing your information.

Call barring by IP

IP Restriction #
The IP blocking security method introduces an additional layer of protection by allowing users to restrict API calls based on the requesters' IP addresses. This means you can control which IPs are allowed to access your API and which are blocked. Below, we detail how this feature works:

Enabling the Feature #
To enable this feature, follow the simple steps below:

Login to Z-API: Access the Z-API control panel with your administrator credentials.

Navigate to the Security Page: In the Z-API dashboard, find the "Security" option in the navigation menu or settings area.

img

Basic Operation: #
When the IP Restriction module is not enabled, the API functions normally and allows access from any IP address making a request. This is suitable for situations where no IP restriction is required and the API must be publicly accessible.

Unregistered IP behavior: #
When a request is made from an IP address that is not in the allowed IP list, the API responds with a clear error message:

{
    "error": "[IP da chamada] not allowed"
}
Benefits of IP blocking: #
Control: With this feature, you have full control over who can access your API, allowing only trusted IPs.

Threat Protection: IP restriction helps protect your API from unauthorized access, attack attempts, and other security threats.

Security Compliance: For companies that need to comply with strict security regulations, this feature can be essential.

The IP Restriction security method makes your API more secure by giving you complete control over who can access it and ensuring that only authorized IPs are allowed to use API resources. This feature is especially useful for protecting sensitive data, preventing abuse, and maintaining the integrity of your API.

Two-factor authentication

Two-Factor Security: #
Implementing an additional authentication step, known as two-factor authentication (2FA), in the Z-API dashboard is an essential security measure to protect your information and instances from unauthorized access. This extra layer of protection requires that, in addition to your regular password, you provide a second authentication factor when logging in.

Enabling the Feature: #
To enable two-factor authentication in the Z-API dashboard, follow these steps:

Go to the Z-API dashboard and log in with your existing credentials.
Navigate to the "Security" section.
Locate the "Two-Factor Authentication" option and click "Set Up Now".
img

After clicking "Set Up Now," the system will generate a unique QR code. This QR code must be synced with an authenticator app, such as 1Password, Google Authenticator, or Microsoft Authenticator, on your mobile device. The authenticator app will be used as the second authentication factor.

Operation #
Open the authenticator app on your mobile device.
Add a new account manually or scan the QR code generated by the Z-API panel.
The authenticator app will link your Z-API account to your device.
Now, every time you log in to the Z-API dashboard, you will be asked to provide a one-time code generated by the authenticator app.
This one-time code is generated every few seconds and is unique to your account, meaning no one else can access your account, even if they know your password.
Benefits of using 2FA #
Implementing two-factor authentication brings several benefits to the security of your Z-API account:

Additional Protection: Even if someone knows your password, they won't be able to access your account without the second factor of authentication.

Preventing Unauthorized Access: 2FA significantly hinders unauthorized access attempts by requiring an additional element that only the account holder possesses (their mobile device).

Sensitive Data Security: If you're handling sensitive or critical information, two-factor authentication is a crucial measure to ensure the integrity of that data.

Compliance with Security Standards: In many industries and regulations, two-factor authentication is a requirement to comply with security standards.

Two-factor authentication is a vital layer of security that protects your accounts and information in the Z-API dashboard from cyberthreats, making unauthorized access much more difficult and ensuring the integrity of your data. Enabling this feature is highly recommended to enhance the security of your operations.

Account Security Token

Account Security Token #
This Z-API security method uses token validation, providing an additional layer of protection for your instances, ensuring that only authorized requests have access to your resources.

Enabling the Feature #
To enable the token validation feature, follow these simple steps:

Log in to your Z-API account.

In the "Security" tab, locate the "Account Security Token" module.

Click "Configure Now." This will generate a token, which will initially be disabled to prevent interruptions to your application's operation.

img

Basic Operation #
The way the token security method works is straightforward:

After generating the token, it must be included in the header of all your HTTP requests.

The token must be passed as follows:

Attribute : Client-Token
Value : [token]
After configuring your environment to send the token in requests, you can click "Activate Token".

From this point on, all instances of your application will only accept requests that contain the token in the header.

Unregistered Token Behavior #
If a request is made without the configured token, the API will respond with an error, as shown in the example below:

{
    "error": "null not allowed"
}
This ensures that only requests authorized with the token are processed.

Benefits of Token Validation #
Token validation offers numerous benefits for the security of your application:

Advanced Protection : The token adds an additional layer of authentication, protecting your application from unauthorized access.

Full Control : You have full control over who can access your instances, ensuring only legitimate requests are served.

With token validation enabled, your Z-API application will be more secure and protected against cyber threats, ensuring the integrity and confidentiality of your data. Be sure to configure and enable this feature in all relevant instances to keep your application secure.

Introduction
But what is an instance after all? #
An instance is a connection from a phone number with a WhatsApp account, which will be responsible for sending and receiving messages. You can create multiple instances so you can have multiple WhatsApp numbers connected to your account.

Technically speaking, an instance is nothing more than a virtual machine (or container) within our server infrastructure, dedicated to providing an environment for connecting your number.

Each instance has only one number; if you need to connect more numbers, you'll need to create more instances. However, an instance isn't tied to a single number; you can disconnect one number and connect another to the same instance.

To help you understand how Z-API works, our service runs on WhatsApp Web, and we abstract the methods, allowing you to manipulate them via the RestFul API.

To make things more tangible, in the next topics we will help you in an orderly manner with the first steps.

Curiosity
It's great to know that every time you create an instance of our FlyBots, which orchestrate all our DevOps, it starts the process of creating a container with the Z-API Stack in Oracle Cloud. Yes! All our services are national and run on Oracle Cloud.

Edit this page

Automatic reading
Conceptualization #
This method enables automatic reading of all messages received by the API.

Method #
/update-auto-read-message#
PUT https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-auto-read-message

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Request Body#
{
  "value" : true or false 
}
Administrative Panel #
img

Response#
200#
{
  "value": true
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Automatic status reading
Conceptualization #
This method enables automatic reading of all status posts received by the API.

Attention
For it to work you must have Auto Read enabled.

Method #
/update-auto-read-status#
PUT https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-auto-read-status

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Request Body#
{
  "value" : true or false 
}
Administrative Panel #
img

Response#
200#
{
  "value":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Update profile picture
Conceptualization #
This method is responsible for changing your profile picture on WhatsApp

Method #
/profile-picture#
PUT https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/profile-picture

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Attributes #
Mandatory #
Attributes	Type	Description
value	string	Image URL
Options #
Attributes	Type	Description
Request Body#
{
  "value" : "Image URL" 
}
Response#
200#
Attributes	Type	Description
value	boolean	true if it worked and false if it failed
Example

{
  "value":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Update profile name
Method #
/profile-name#
PUT https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/profile-name

Conceptualization #
This method is responsible for changing your profile name on WhatsApp

Attributes #
Mandatory #
Attributes	Type	Description
value	string	Profile name
Options #
Attributes	Type	Description
Request Body#
Body#
{
  "value" : "Profile Name" 
}
Response#
200#
Attributes	Type	Description
value	boolean	true if it worked and false if it failed
Example

{
  "value":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Update profile description

Method #
/profile-description#
PUT https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/profile-description

Conceptualization #
This method is responsible for changing your profile description on WhatsApp

Attributes #
Mandatory #
Attributes	Type	Description
value	string	Profile description
Options #
Attributes	Type	Description
Request Body#
Body#
{
  "value" : "Profile Description" 
}
Response#
200#
Attributes	Type	Description
value	boolean	true if it worked and false if it failed
Example

{
  "value":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Reject calls

Conceptualization #
This method enables the Automatic Call Reject option in your API. With it enabled, all voice calls received by the number connected to the API will be automatically rejected.

Method #
/update-call-reject-auto#
PUT https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-call-reject-auto

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Request Body#
{
"value" : true or false 
}
Administrative Panel #
img

Response#
200#
{
  "value":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Connection message
Conceptualization #
Using this method, you define the message that will be sent after rejecting the voice call received via the API.

Important
For the message to be sent, the previous method (Reject calls) must be active!

Method #
/update-call-reject-message#
PUT https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-call-reject-message

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Request Body#
{
  "value" : "Reply message" 
}
Administrative Panel #
img

Response#
200#
{
  "value":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Get QR Code
Conceptualization #
Yes! Just like WhatsApp Web, you'll need to scan a QR Code or use a phone number to connect to the Z-API.

There are two ways you can make this connection:

If you log in through our admin panel or
Make the experience available within your own application using the methods described in this section.
You can choose one of the available methods to read the WhatsApp QR Code, as shown below:

Methods #
/qr-code#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/qr-code

Getting QRCode - bytes

This method returns the QRCode bytes. You can render it in a QRCode component compatible with your programming language.

/qr-code/image#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/qr-code/image

Getting QR Code - Image

This method returns a base64 image. You can render it in an image component compatible with your programming language.

/phone-code/{phone}#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/phone-code/{phone}

Getting QRCode - Phone

This method returns a code so that it is possible to connect the number to the API without the need to read a QR code, just by inserting the generated code.

You can insert the code generated through the API directly into WhatsApp, in the same tab where the QR code is read, by clicking on "Connect with phone number".

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Code#
note
If you have chosen to implement QRCode reading in your application, you need to know that WhatsApp invalidates the QRCode every 20 seconds.

If you call the method and are already connected, it will not allow you to connect again.

Once connected, you can start using Z-API methods to manipulate your WhatsApp.

important
Recommendations:

Create a method with intervals between 10 and 20 seconds to call the API and get the new QRCode.
If the user does not read the QR Code after 3 calls, interrupt the flow and add a button requesting interaction to avoid unnecessary calls to the WhatsApp API.

Restart instance

Conceptualization #
If, like any good Dev, you skipped the introduction and still don't have a clear understanding of the concept of an instance, I strongly suggest you take a step back and read the introduction to this topic.

Okay, now that you know what an instance is, it's much easier to explain :)

This method is basically the "Restart" button on your operating system, that is, like every expert user, in cases where everything seems to go wrong, try control+alt+del or restart!

Method #
/restart#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/restart

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Response#
200#
{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#
note
No! You don't need to scan the QR Code if you restart your instance.

Disconnect
Conceptualization #
This method disconnects your number from Z-API.

But don't worry, to connect again just scan the QR Code :)

Method #
/disconnect#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/disconnect

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Code#
Don't forget!
Once disconnected, all API methods become unavailable and webhooks stop being sent.

Instance status
Conceptualization #
This method allows you to find out whether or not your instance is connected to a WhatsApp account.

Method #
/Status#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/status

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Attributes #
Attributes	Type	Description
connected	boolean	Indicates whether your number is connected to Z-API
error	string	Provides details if any of the attributes are not true - 'You are already connected.' - 'You need to restore the session.' - 'You are not connected.'
smartphoneConnected	boolean	Indicates whether the cell phone is connected to the internet
Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/status");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "accept: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Cell phone data

Method #
/device#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/device

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for returning information about the connected device/cell phone

Attributes #
{
    "phone": "",
    "imgUrl": "",
    "name": "",
    "device": {
        "sessionName": "Z-API",
        "device_model": "Z-API"
    },
    "originalDevice": "iphone", "smbi", "android", "smba", 
    "sessionId": 175,
    "isBusiness": false
}
Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/device");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Rename instance
Conceptualization #
Method used to rename an instance.

Method #
/update-name#
PUT https://api.z-api.io/instances/ID_INSTANCE/token/TOKEN_INSTANCE/update-name

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Attributes #
Mandatory #
Attributes	Type	Description
value	string	New name for the instance
Request Body#
{
  "value" : "new name" 
}
Response#
200#
Return
{
    "value":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "PUT");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "authorization: Bearer SEU-TOKEN-AQUI");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"value\": \"Name\"}");

CURLcode ret = curl_easy_perform(hnd);

Instance data
Conceptualization #
This method allows you to get data from your instance.

Method #
/me#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/me

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Response#
200#
Attributes	Type	Description
id	string	Instance ID
token	string	Instance token
name	string	Instance name
due	number	Timestamp with the instance expiration date (unix timestamp)
connected	boolean	Defines whether the instance is connected
paymentStatus	string	Sets the payment status of the instance
created	Date	Instance creation date
connectedCallbackUrl	string	Connection webhook url
deliveryCallbackUrl	string	Message sending webhook URL
disconnectedCallbackUrl	string	Disconnection webhook url
messageStatusCallbackUrl	string	Message Status Webhook Url
presenceChatCallbackUrl	string	Chat Presence Webhook Url
receivedCallbackUrl	string	Receiving webhook URL
receiveCallbackSentByMe	boolean	Defines whether you will receive webhooks for messages sent by the instance itself.
callRejectAuto	boolean	Sets whether to reject an incoming call automatically
callRejectMessage	string	Message to be sent when rejecting a call
autoReadMessage	boolean	Sets whether to automatically mark received messages as read
initialDataCallbackUrl	string	Initial data webhook url after connection
Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/me");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "accept: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Introduction
Conceptualization #
In this topic, you will learn about all the available methods for registering a number in a mobile instance.

What are mobile instances? Mobile instances are basically like your own cell phone! Instead of being connected as a secondary device—like a web instance—they're the primary device. This means that, in addition to connecting a phone to this instance, you can also connect other devices—like web and desktop—from it! Amazing, right?!

Additionally, there are several advantages to connecting your number to a mobile device. One of them is the security settings for your WhatsApp account, such as: setting up an email address , setting a PIN code , removing an email address , removing a PIN code , searching for the email address registered to the account , checking if you have a PIN code configured , and more.

Now that you understand and see the advantages of the mobile instance, let's code !

Steps to connect a number #
Start by checking your number's availability for registration on a new primary device. Using this API, you can check whether the number is banned and whether it's possible to request a confirmation code via SMS, voice call, or mobile app. For more details, see the section below:

Check registration availability
If the number is not banned and one of the methods for sending the confirmation code is available (SMS, voice call or mobile app), simply use the following endpoint to request it to be sent:

Request confirmation code
In some cases, after requesting the code, you're required to respond to a captcha to proceed with the code confirmation. In this case, the base64 of the captcha image is returned in the API preceding this one - Request confirmation code . Use the following API to confirm this captcha.

Captcha verification
After verifying the captcha, if this was your case, we can proceed to confirm the code that was sent to you using the chosen method.

Confirm code
If you have set up a security PIN code on your WhatsApp account, after confirming the registration code (previous step) you will be asked to confirm your PIN code.

Confirm PIN code
If you have forgotten your security PIN code, you can request an email to retrieve it using the API below:

PIN code recovery
Phew! If you followed this step-by-step guide, you should already be connected to a mobile instance! Now, just let your imagination run wild!

Tip
Keep in mind that other WhatsApp-related APIs—such as messaging and account interactions—work the same way as for web instances. In other words, the methods are fully compatible between instances.

Check registration availability
Method #
/mobile/registration-available#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/mobile/registration-available

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
A method used to check a number's registration availability. This method must precede the code request method, as it not only retrieves availability information but also performs a WhatsApp onboarding setup for the number. This API also allows you to see the available methods for requesting a confirmation code and determine whether the number is banned.

Attributes #
Mandatory #
Attributes	Type	Description
no	string	DDI of the number
phone	string	Phone number you wish to register. Must include only the number with area code (Ex: 4499999999), without formatting or masking
Request Body#
{
    "she" : "55" , 
    "phone": "4499999999"
}
Response#
200#
Attributes	Type	Description
available	boolean	Returns true if the number is available for registration. If the response is false, you will not be able to proceed to the next step of the registration process.
blocked	boolean	Specifies whether the number is banned or blocked for some other reason. If this is the case, use the appealToken attribute to request an unban.
appealToken	string	If the number is banned, this attribute will be returned containing a token for unban request.
smsWaitSeconds	number	Time to wait for SMS request . If the value is 0, it means the request can now be sent to this method.
voiceWaitSeconds	number	Time to wait for a voice call request . Same purpose as smsWaitSeconds
waOldWaitSeconds	number	The amount of time you must wait for a pop-up request in the mobile app . This serves the same purpose as smsWaitSeconds . Note : Do not use this method if you do not have access to the phone where the number is currently linked. This method is useful for speeding up the code confirmation process, without having to wait for an SMS or voice call. However, it requires you to have the device handy and the WhatsApp app open.
waOldEligible	boolean	Defines whether the method of requesting the code via pop-up in the mobile application is available.
reason	string	In case of error, this attribute tells the reason why the error occurred
Example #
Available number case #
{
    "available": true,
    "smsWaitSeconds": 0,
    "voiceWaitSeconds": 0,
    "waOldWaitSeconds": 0,
    "waOldEligible": true
}
Banned number case #
{
    "available": false,
    "blocked": true,
    "appealToken": "Ae0B_6FfVfyB8on0v76ALf1RkWXFFsfvliOdh02JyXTFcbnlTAwO5_h5Ju4L5zfa-fhWKIzQhtXYhZTGRZxwYE3_iPgJ0nimuOkjrZLvnBOf-5Sitf2zmJJRs--1EJc5mvYRA1qJnHyktSBM7ZQWrsV9Lddyrj0TyCMKa_nXhvHwNfg8n5yz7tita5s"
}
Attention
There are some scenarios where a number is blocked from being connected even in the official WhatsApp app. In this case, the number availability check API is unable to identify this, and it ends up returning that the number is blocked only when requesting the code. Unfortunately, there's currently nothing we can do about this because, unlike a standard ban, a token (appealToken) is not provided to make an unban request.

400#
Invalid request. Please verify that the data you are sending complies with the documentation above.

405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/mobile/registration-available");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"ddi\": \"55\", \"phone\": \"4499999999\"}");

CURLcode ret = curl_easy_perform(hnd);

Request confirmation code
Method #
/mobile/request-registration-code#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/mobile/request-registration-code

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is used to request a confirmation code. To use this method, you must first verify that the number is available for registration. Without this verification, you will not be able to request the code.

Attention
Don't forget that the phone number you must send in this request is the same one you verified in the previous API . Remember, verifying that the number is available is mandatory to request the confirmation code.

Attributes #
Mandatory #
Attributes	Type	Description
no	string	DDI of the number
phone	string	Phone number you wish to register. Must include only the number with area code (Ex: 4499999999), without formatting or masking
method	string	Defines the method for sending the code. SMS, voice call, or pop-up in the WhatsApp app. (sms, voice, wa_old)
Request Body#
{
    "she" : "55" , 
    "phone": "4499999999",
    "method": "sms | voice | wa_old"
}
Response#
200#
Attributes	Type	Description
success	boolean	Returns true if the code request was sent successfully. Check if you received the code and use it in the Confirm Code API.
captcha	string	Base64 image with captcha code. If you receive this attribute, you'll need to confirm this code in the Captcha Confirmation API for the code to actually be sent. After confirming the Captcha, there's no need to request the code again; just wait for it to be received.
blocked	boolean	Defines whether the number is banned or not
retryAfter	string	Time in seconds that must be waited for a new code request
smsWaitSeconds	number	Time to wait for SMS request . If the value is 0, it means the request can now be sent to this method.
voiceWaitSeconds	number	Time to wait for a voice call request . Same purpose as smsWaitSeconds
waOldWaitSeconds	number	The amount of time you must wait for a pop-up request in the mobile app . This serves the same purpose as smsWaitSeconds . Note : Do not use this method if you do not have access to the phone where the number is currently linked. This method is useful for speeding up the code confirmation process, without having to wait for an SMS or voice call. However, it requires you to have the device handy and the WhatsApp app open.
method	string	Code sending method
Example #
Success story #
{
    "success": true,
    "retryAfter": 165,
    "smsWaitSeconds": 125,
    "voiceWaitSeconds": 125,
    "waOldWaitSeconds": 125,
    "method": "sms"
}
Banned number case #
{
    "success": false,
    "blocked": true
}
400#
Invalid request. Please verify that the data you are sending complies with the documentation above.

405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/mobile/request-registration-code");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"ddi\": \"55\", \"phone\": \"4499999999\", \"method\": \"sms | voice | wa_old\"}");

CURLcode ret = curl_easy_perform(hnd);

Responder captcha
Method #
/mobile/respond-captcha#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/mobile/respond-captcha

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method used to respond to the captcha required to send the confirmation code. This method is only necessary if the code request API responds with the "captcha" attribute, which in turn contains the base64 of the captcha image.

Attributes #
Mandatory #
Attributes	Type	Description
captcha	string	Captcha code for confirmation. This captcha is displayed in the image returned when requesting the confirmation code.
Request Body#
{
    "captcha": "123456"
}
Response#
200#
Attributes	Type	Description
success	boolean	Returns true if the captcha was answered correctly. Therefore, wait for the confirmation code and use it in the Confirm Code API.
Example #
{
    "success": true
}
400#
Invalid request. Please verify that the data you are sending complies with the documentation above.

405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/mobile/respond-captcha");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"captcha\": \"123456\"}");

CURLcode ret = curl_easy_perform(hnd);

Confirm code
Method #
/mobile/confirm-registration-code#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/mobile/confirm-registration-code

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is used to confirm the code you received. To use this method, you must complete the previous registration steps, which involve checking the number's registration availability and requesting the confirmation code. Once you receive the code, you can use this route to confirm and connect the number to the mobile instance.

Attributes #
Mandatory #
Attributes	Type	Description
code	string	confirmation code
Request Body#
{
    "code": "123456"
}
Response#
200#
Attributes	Type	Description
success	boolean	Returns true if the code was successfully verified. Once this is done, the instance will be connected.
confirmSecurityCode	boolean	Returns true if two-step verification code confirmation is required.
Example #
{
    "success":true 
}
{
    "success":false, 
    "confirmSecurityCode": true
}
400#
Invalid request. Please verify that the data you are sending complies with the documentation above.

405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/mobile/confirm-registration-code");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"code\": \"123456\"}");

CURLcode ret = curl_easy_perform(hnd);

Request unbanning
Method #
/mobile/request-unbanning#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/mobile/request-unbanning

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method used to request unban of a number.

Attributes #
Mandatory #
Attributes	Type	Description
appealToken	string	Token to unban a specific number
description	string	Description to be sent for WhatsApp analysis
Request Body#
{
    "appealToken": "Ae1CIGl4Mq7kQ09OQzUnnCx2mTPHxZCjPesdRc8Z1lNFV9d6gvtd5LDW0r7ukVAgtMOP2AxckQM6QeyVp7bL0RbbVac6GQUtMd4tYAZsPOwSIQKlVIoTZs2akgcRd-jvhLKh32roOd0KFPg7hAaYURpIuDXhkaZ_gLJLhmzADNp3lxUNdsIg10q92w",
    "description" : "I was chatting normally and got banned" 
}
Response#
200#
Attributes	Type	Description
success	boolean	Returns true if the request was successful.
status	string	Unban request status (IN_REVIEW, UNBANNED)
Example #
{
    "success":true, 
    "status": "IN_REVIEW | UNBANNED"
}
400#
Invalid request. Please verify that the data you are sending complies with the documentation above.

405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/mobile/respond-captcha");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"captcha\": \"123456\"}");

CURLcode ret = curl_easy_perform(hnd);

Confirm PIN code
Method #
/mobile/confirm-pin-code#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/mobile/confirm-pin-code

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method used to confirm your account's PIN code. This method is only necessary if you have set up two-step verification on WhatsApp. If this is the case, this PIN code must be confirmed; otherwise, you won't be able to connect the number to a mobile instance.

Attributes #
Mandatory #
Attributes	Type	Description
code	string	Two-Step Verification PIN Code
Request Body#
{
    "code":"123456" 
}
Response#
200#
Attributes	Type	Description
success	boolean	Returns true if the code was successfully verified. Once this is done, the instance will be connected.
Example #
{
    "success":true 
}
400#
Invalid request. Please verify that the data you are sending complies with the documentation above.

405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/mobile/confirm-security-code");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"code\": \"123456\"}");

CURLcode ret = curl_easy_perform(hnd);

PIN code recovery
Method #
/mobile/recovery-pin-code#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/mobile/recovery-pin-code

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is used to request an email to recover your account's PIN code. This is useful if you've set up two-step verification on WhatsApp and no longer remember it. WhatsApp will send a PIN reset link to the email address you linked to your WhatsApp account.

Response#
200#
Attributes	Type	Description
success	boolean	Returns true if the recovery email has been sent.
Example #
{
    "success":true 
}
400#
Invalid request. Please verify that the data you are sending complies with the documentation above.

405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

Search account email
Method #
/security/email#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/security/email

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method used to search for the email configured in the WhatsApp account.

Attention
This API is only available for mobile instances.

Response#
200#
Attributes	Type	Description
success	boolean	Defines whether the request was executed successfully
hasEmail	boolean	Defines whether the account has an email configured
email	string	Email configured on the account
verified	boolean	Defines whether the email has been verified
Example #
{
    "success":true, 
    "hasEmail": true,
    "email": "example@email.com",
    "verified": true
}
400#
Invalid request. Please verify that the data you are sending complies with the documentation above.

405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

Register email in account
Method #
/security/email#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/security/email

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method used to register an email address for your WhatsApp account. This email address can be used later to recover your account's security PIN.

Attention
This API is only available for mobile instances.

Attributes #
Mandatory #
Attributes	Type	Description
email	string	Email to be registered in your WhatsApp account
Request Body#
{
    "email": "example@email.com"
}
Response#
200#
Attributes	Type	Description
success	boolean	Defines whether the request was executed successfully
message	string	If successful, you can request email verification (VERIFY_EMAIL). This will send an email to the address provided in the request containing a code that must be used in the email verification API to complete the registration. If unsuccessful, an error message will be returned.
Example #
{
    "success":true, 
    "message": "VERIFY_EMAIL"
}
400#
Invalid request. Please verify that the data you are sending complies with the documentation above.

405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

Verify account email
Method #
/security/verify-email#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/security/verify-email

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method used to verify an account's email address. You can register an email address for your WhatsApp account using the Register Email Address API .

Attention
This API is only available for mobile instances.

Attributes #
Mandatory #
Attributes	Type	Description
verificationCode	string	Verification code sent to the email address registered with the account
Request Body#
{
    "verificationCode": "123456"
}
Response#
200#
Attributes	Type	Description
success	boolean	Defines whether the request was executed successfully
Example #
{
    "success":true 
}
400#
Invalid request. Please verify that the data you are sending complies with the documentation above.

405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/security/verify-email");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"verificationCode\": \"123456\"}");

CURLcode ret = curl_easy_perform(hnd);

Check if you have a PIN code
Method #
/security/two-fa-code#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/security/two-fa-code

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method used to check if your account has a registered security PIN code.

Attention
This API is only available for mobile instances.

Response#
200#
Attributes	Type	Description
success	boolean	Defines whether the request was executed successfully
hasCode	boolean	Defines whether the account has a registered PIN code
Example #
{
    "success":true, 
    "hasCode": true
}
400#
Invalid request. Please verify that the data you are sending complies with the documentation above.

405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/security/two-fa-code");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Register PIN code
Method #
/security/two-fa-code#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/security/two-fa-code

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method used to register a security PIN code on your WhatsApp account.

Attention
This API is only available for mobile instances.

Attributes #
Mandatory #
Attributes	Type	Description
code	string	Security PIN code to be registered in the account
Request Body#
{
    "code":"123456" 
}
Response#
200#
Attributes	Type	Description
success	boolean	Defines whether the request was executed successfully
Example #
{
    "success":true 
}
400#
Invalid request. Please verify that the data you are sending complies with the documentation above.

405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/security/two-fa-code");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"code\": \"123456\"}");

CURLcode ret = curl_easy_perform(hnd);

Remove email from account
Method #
/security/email/remove#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/security/email/remove

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method used to remove the email configured in your WhatsApp account.

Attention
This API is only available for mobile instances.

Response#
200#
Attributes	Type	Description
success	boolean	Defines whether the request was executed successfully
message	string	In case of failure, it returns a message regarding the error. In case of success, it can return a confirmation.
Example #
{
    "success":true, 
    "message":"REMOVED" 
}
400#
Invalid request. Please verify that the data you are sending complies with the documentation above.

405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/security/email/remove");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Remove PIN code
Method #
/security/two-fa-code/remove#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/security/two-fa-code/remove

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method used to remove account security PIN code.

Attention
This API is only available for mobile instances.

Response#
200#
Attributes	Type	Description
success	boolean	Defines whether the request was executed successfully
message	string	In case of failure, returns a message regarding the error
Example #
{
    "success":true 
}
400#
Invalid request. Please verify that the data you are sending complies with the documentation above.

405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

Introduction
Conceptualization #
First, what you need to understand about messages is that they can be sent to a contact, a group, or a broadcast list.

In the "contacts" topic, I'll talk about this again, but it's also important for you to know that for WhatsApp, everything is a chat, whether it's a contact, a group, or a broadcast list.

To send any message, you need a chat ID, which are:

For contacts it is the number itself;
For groups it is the concatenation of the group founder number with a timestamp and
For broadcast lists it is the concatenation of the string 'broadcast' with the timestamp.
These IDs are all returned by the get/chats method, which you will learn about a little later.

Speaking of ID, we strongly recommend that you store in your application the messageId that our response will return, as shown in the image below, because if you need to reply, mark or even delete a message, you will need to inform the messageId as an attribute in the method.

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId": "D241XXXX732339502B68" // salve este ID
}
Tip
You can format your texts by sending formatting characters and making your message more elegant.

Send plain text
Method #
/send-text#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-text

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
With this method, you can send simple texts, but you can enhance them using text formatting and emojis, for example. If you're not sure how to do this yet, click the links below and follow the instructions:

To learn how to format fonts in WhatsApp click here

You can also use line breaks in your messages, but this can be done in different ways, depending on factors such as the platform your application is running on and the programming language used. So far, we've identified the following methods:

\n
\r
\r\n
%0a
Check which one best suits your case.

If you discover a new way to do line breaks, please let us know :)

Another resource you can explore is using emojis. If you need to grab some emojis, use this link .

About emojis
An emoji is a normal ASCII character, just as there is the Times New Roman font for example, there are emoji fonts, think that you can create your own emoji gallery.

To take the test, just copy an emoji and paste it into your text! You can use this one 🤪 if you like.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
message	string	Text to be sent
Options #
Attributes	Type	Description
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex.: "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
delayTyping	number	In this attribute, a delay is added to the message. You can choose between a range of 1~15 sec, which means how many seconds the message will remain in the "Typing..." status. (Ex. "delayTyping": 5, ). The default delay, if not specified, is 0.
editMessageId	string	This attribute allows you to edit previously sent messages on WhatsApp. Use the message ID and the new content in the JSON to make changes. You must configure the webhook before editing.
Request Body#
{
  "phone": "5511999999999",
  "message": "Welcome to *Z-API*"
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId": "D241XXXX732339502B68",
  "id": "D241XXXX732339502B68"
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-text");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"message\": \"Welcome to *Z-API*\"}");

CURLcode ret = curl_easy_perform(hnd);

Forward message
Method #
/forward-message#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/forward-message

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Simple and objective, in this method you can forward messages through the API, only needing the messageId of the message you want to forward, and the phone number of the chat where this messageId is located.

Attention
To use this method, you need to configure the webhook. If you haven't already, the message will not be forwarded.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in DDI DDD NUMBER format. Ex: 551199999999. IMPORTANT: Send only numbers, without formatting or masking.
messageId	string	ID of the message to be forwarded
messagePhone	string	Chat number where the messageId is located
Options #
Attributes	Type	Description
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
Request Body#
{
  "phone":"5511999999999", 
  "messageId": "3999984263738042930CD6ECDE9VDWSA",
  "messagePhone": "5511888888888"
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/forward-message");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"messageId\": \"3999984263738042930CD6ECDE9VDWSA\", \"messagePhone\": \"5511888888888\"}");

CURLcode ret = curl_easy_perform(hnd);

Send reaction
Method #
/send-reaction#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-reaction

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
In this method you can send reactions to messages sent or received, you need to enter the chat phone number, an emoji and the message that will be reacted to!

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
reaction	string	Reaction emoji (see emoji options at this link )
messageId	string	Message ID that will receive the reaction
Options #
Attributes	Type	Description
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
Request Body#
{
  "phone": "PHONE DO CHAT",
  "reaction": "❤️",
  "messageId" : "message to be reacted to" 
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-reaction");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"reaction\": \"❤️\", \"messageId\": \"EDSFSAD213213DDSD7\"}");

CURLcode ret = curl_easy_perform(hnd);

Remove reaction
Method #
/send-remove-reaction#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-remove-reaction

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method removes the reaction from sent or received messages. You'll need to provide the chat phone number and the message's message ID!

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
messageId	string	Message ID that will be removed from the reaction
Options #
Attributes	Type	Description
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
Request Body#
{
  "phone":"PHONE DO CHAT", 
  "messageId" : "message to be removed reaction" 
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to the webhook response (upon receipt). NOTE : When the "Reaction" returns , it will be empty.

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-remove-reaction");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"messageId\": \"EDSFSAD213213DDSD7\"}");

CURLcode ret = curl_easy_perform(hnd);

Send image
Method #
/send-image#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-image

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method responsible for sending images to your chats, you can work with images in 2 ways:

By Link, where you have an image hosted somewhere on the internet and just send the link to it.

For Base64, if you choose this option you will need to have in your application a method to convert the image to Base64, to make sure your conversion worked copy the generated Base64 and paste it into the address bar of your browser, if it is a valid image your browser will be able to render it, if the browser cannot, review your method :).

IMPORTANT if you choose base64 before binary you need to add the following expression data:image/png;base64, * your base64 code *

You can test this type of sending using an online image to Base64 converter.

Examples:

converter 1

converter 2

Size and formats #
WhatsApp limits file sizes and its policy changes constantly, so we always recommend checking directly on the WhatsApp website.

In this link you will find everything you need to know about file formats and sizes.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
image	string	Image link or its Base64
Options #
Attributes	Type	Description
caption	string	Title of your image
messageId	String	Attribute used to reply to a chat message, just add the messageId of the message you want to reply to in this attribute
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
viewOnce	boolean	Defines whether it will be a single view message or not
Request Body#
Sending by URL

{
  "phone":"5511999999999", 
  "image": "https://www.z-api.io/wp-content/themes/z-api/dist/images/logo.svg",
  "caption": "Logo",
  "viewOnce": false
}
Base64 Sending

{
  "phone":"5511999999999", 
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAMgCAIAAABUEpE",
  "caption":"Logo", 
  "viewOnce":false 
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-image");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"image\": \"https://www.z-api.io/wp-content/themes/z-api/dist/images/logo.svg\"}");

CURLcode ret = curl_easy_perform(hnd);

Send sticker
Method #
/send-sticker#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-sticker

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method responsible for sending images to your chats, you can work with images in 2 ways:

By Link, where you have a sticker hosted somewhere on the internet and just send the link to it.

For Base64, if you choose this option you will need to have in your application a method to convert the sticker to Base64, to make sure your conversion worked copy the generated Base64 and paste it into the address bar of your browser, if it is a valid sticker your browser will be able to render it, if the browser cannot, review your method :).

IMPORTANT if you choose base64 before binary you need to add the following expression data:image/png;base64, * your base64 code *

You can test this type of sending using an online image to Base64 converter.

Examples:

converter 1

converter 2

Size and formats #
WhatsApp limits file sizes and its policy changes constantly, so we always recommend checking directly on the WhatsApp website.

In this link you will find everything you need to know about file formats and sizes.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
sticker	string	Sticker link or its Base64
Options #
Attributes	Type	Description
messageId	String	Attribute used to reply to a chat message, just add the messageId of the message you want to reply to in this attribute
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
stickerAuthor	string	Name of sticker author
Request Body#
Sending by URL

{
  "phone":"5511999999999", 
  "sticker": "https://www.z-api.io/wp-content/themes/z-api/dist/images/logo.svg",
  "stickerAuthor": "Z-API"
}
Base64 Sending

{
  "phone":"5511999999999", 
  "sticker": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAMgCAIAAABUEpE/",
  "stickerAuthor":"Z-API" 
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-sticker");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"sticker\": \"https://www.z-api.io/wp-content/themes/z-api/dist/sticker/logo.svg\"}");

CURLcode ret = curl_easy_perform(hnd);


Method #
/send-gif#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-gif

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method responsible for sending GIFs to your chats through the API (The file to be sent must be an MP4)

Size and formats #
WhatsApp limits file sizes and its policy changes constantly, so we always recommend checking directly on the WhatsApp website.

In this link you will find everything you need to know about file formats and sizes.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
gif	string	Link to your GIF file (The file must be an mp4)
Options #
Attributes	Type	Description
messageId	String	Attribute used to reply to a chat message, just add the messageId of the message you want to reply to in this attribute
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
caption	String	Message you want to send, along with the gif
Request Body#
Sending by URL

{
  "phone": "5544999999999",
  "gif": "https://file-examples.com/storage/fe88505b6162b2538a045ce/2017/04/file_example_MP4_480_1_5MG.mp4",
  "caption": ""
}
Base64 Sending

{
  "phone":"5544999999999", 
  "gif": "data:video/mp4;base64,AAYXJ0eHJlZgIGZ0eXBtc0eHDQyAAg3NDINCiUlRUAAAG1wNDJtcD",
  "caption":"" 
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-gif");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"gif\": \"https://file-examples.com/storage/fe88505b6162b2538a045ce/2017/04/file_example_MP4_480_1_5MG.mp4\"}");

CURLcode ret = curl_easy_perform(hnd);

Send audio
Method #
/send-audio#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-audio

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method responsible for sending audios to your chats, you can work with the audios in 2 ways:

By Link, where you have an audio hosted somewhere on the internet and just send the link to it.

For Base64, if you choose this option you will need to have a method in your application to convert the audio to Base64.

Size and formats #
WhatsApp limits file sizes and its policy changes constantly, so we always recommend checking directly on the WhatsApp website.

In this link you will find everything you need to know about file formats and sizes.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
audio	string	Audio link or its Base64
Options #
Attributes	Type	Description
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
delayTyping	number	In this attribute, a delay is added to the message. You can choose between a range of 1~15 sec, which means how many seconds the status will remain "Recording audio...". (Ex. "delayTyping": 5, ). The default delay, if not specified, is 0.
viewOnce	boolean	Defines whether it will be a single view message or not
async	boolean	If enabled, the request will respond immediately with success, and the file will be processed in the background. The upload can be verified via the upload webhook .
waveform	boolean	Defines whether the audio will be sent with sound waves or not
Request Body#
Sending by URL

{
  "phone":"5511999999999", 
  "audio": "https://tuningmania.com.br/autosom/mp3/75%20~%2079%20Hz.MP3",
  "viewOnce": false,
  "waveform": true
}
Base64 Sending

{
  "phone":"5511999999999", 
  "audio": "data:audio/mpeg;base64,SUQzAwAAAAAAbVRYWFgAAAAgAAAARW5jb2RlZCBieQBMQU1FIGluIEZMIFN0dWRpbyAyMFRYWFgAAAAbAAAAQlBN",
  "viewOnce":false, 
  "waveform":true 
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-audio");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"audio\": \"https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3\"}");

CURLcode ret = curl_easy_perform(hnd);

Send video
Method #
/send-video#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-video

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method responsible for sending video to your chats, you can work with videos in 2 ways:

By Link, where you have a video hosted somewhere on the internet and just send the link.

For Base64, if you choose this option you will need to have a method in your application to convert the video to Base64.

Size and formats #
WhatsApp limits file sizes and its policy changes constantly, so we always recommend checking directly on the WhatsApp website.

In this link you will find everything you need to know about file formats and sizes.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
video	string	Video link or its Base64
Options #
Attributes	Type	Description
messageId	String	Attribute used to reply to a chat message, just add the messageId of the message you want to reply to in this attribute
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
caption	String	Message you want to send, along with the video
viewOnce	boolean	Defines whether it will be a single view message or not
async	boolean	If enabled, the request will respond immediately with success, and the file will be processed in the background. The upload can be verified via the upload webhook .
Request Body#
Sending by URL

{
  "phone":"5511999999999", 
  "video": "https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_480_1_5MG.mp4",
  "caption": "Test",
  "viewOnce":false 
}
Base64 Sending

{
  "phone":"5544999999999", 
  "video": "data:video/mp4;base64,AAYXJ0eHJlZgIGZ0eXBtc0eHDQyAAg3NDINCiUlRUAAAG1wNDJtcD",
  "caption":"Test", 
  "viewOnce":false 
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-video");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"video\": \"http://techslides.com/demos/sample-videos/small.mp4s\"}");

CURLcode ret = curl_easy_perform(hnd);

Send PTV
Method #
/send-ptv#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-ptv

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
The acronym PTV comes from "Pre-Recorded Transfer Video".

Method responsible for sending PTV to your chats, you can work with PTV in 2 ways:

By Link, where you have a video hosted somewhere on the internet and just send the link.

For Base64, if you choose this option you will need to have a method in your application to convert the video to Base64.

Size and formats #
WhatsApp limits file sizes and its policy changes constantly, so we always recommend checking directly on the WhatsApp website.

In this link you will find everything you need to know about file formats and sizes.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
ptv	string	Video link or its Base64
Options #
Attributes	Type	Description
messageId	String	Attribute used to reply to a chat message, just add the messageId of the message you want to reply to in this attribute
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
Request Body#
Sending by URL

{
  "phone":"5511999999999", 
  "ptv": "http://techslides.com/demos/sample-videos/small.mp4"
}
Base64 Sending

{
  "phone":"5544999999999", 
  "ptv": "data:video/mp4;base64,AAYXJ0eHJlZgIGZ0eXBtc0eHDQyAAg3NDINCiUlRUAAAG1wNDJtcD"
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-ptv");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"ptv\": \"http://techslides.com/demos/sample-videos/small.mp4s\"}");

CURLcode ret = curl_easy_perform(hnd);

Send documents
Method #
/send-document/{extension}#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-document/ {extension}

Don't forget! You need to specify the {extension} parameter with the extension of the file you want to send! In theory, this method should support all document types, as long as they fall within WhatsApp's file size policies (to learn more about these limits, click here ).

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Size and formats #
WhatsApp limits file sizes and its policy changes constantly, so we always recommend checking directly on the WhatsApp website.

In this link you will find everything you need to know about file formats and sizes.

Conceptualization #
Method responsible for sending documents to your contacts, it is simple and objective.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
document	string	Document link or its Base64
Options #
Attributes	Type	Description
fileName	String	Document name
caption	String	File description
messageId	String	Attribute used to reply to a chat message, just add the messageId of the message you want to reply to in this attribute
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
Request Body#
Sending by URL

{
  "phone":"5544999999999", 
  "document": "https://expoforest.com.br/wp-content/uploads/2017/05/exemplo.pdf",
  "fileName" : "My PDF" 
}
Base64 Sending

{
  "phone":"5544999999999", 
  "document": "data:application/pdf;base64,JVBERiN0YXJ0eHJlZg0KMjg3NDINCiUlRU9G0xLj",
  "fileName" : "My PDF" 
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-document/pdf");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"document\": \"https://expoforest.com.br/wp-content/uploads/2017/05/exemplo.pdf\", \"fileName\": \"Meu PDF\"}");

CURLcode ret = curl_easy_perform(hnd);

Send link
Method #
/send-link#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-link

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method responsible for sending a link to your contacts, widely used to share links so that users are directed to a website.

About links
It's important to know that the link is only clickable if the recipient already has your phone number in their contacts, or if they start a conversation with you.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
message	string	Text about your link. Don't forget to include the same linkURL value at the end of this text.
image	string	Image link
linkUrl	string	Your link URL
title	string	Title for the link
linkDescription	string	link description
Options #
Attributes	Type	Description
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
delayTyping	number	In this attribute, a delay is added to the message. You can choose between a range of 1~15 sec, which means how many seconds the message will remain in the "Typing..." status. (Ex. "delayTyping": 5, ). The default delay, if not specified, is 0.
linkType	String	Attribute used to define the size of the link preview message sent (SMALL, MEDIUM, or LARGE). The default size if not specified is SMALL.
Request Body#
{
  "phone": "5511999998888",
  "message" : "Here you put a text about the website, please note that this text needs to have the link that will be sent at the end of the message! Like this: https://z-api.io" , 
  "image": "https://firebasestorage.googleapis.com/v0/b/zaap-messenger-web.appspot.com/o/logo.png?alt=media",
  "linkUrl": "https://z-api.io",
  "title": "Z-API",
  "linkDescription" : "WhatsApp Integration" 
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-link");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\",\"message\": \"Aqui você coloca um texto sobre o site, atenção esse texto preciso ter o link que será enviado no final da mensagem! Assim: https://z-api.io\",\"image\": \"https://firebasestorage.googleapis.com/v0/b/zaap-messenger-web.appspot.com/o/logo.png?alt=media\",\"linkUrl\": \"https://z-api.io\",\"title\": \"Z-API\",\"linkDescription\": \"Integração com o whatsapp\"}");

CURLcode ret = curl_easy_perform(hnd);

Send location
Method #
/send-location#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-location

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method responsible for sending a fixed location to your contacts, widely used to send the location of an address.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
title	string	Title for your location e.g.: My house
address	string	Address of the location you are sending consisting of street, NUMBER, neighborhood, city, state and zip code, all separated by commas
latitude	string	Latitude of the sent location
longitude	string	Longitude of the sent location
Options #
Attributes	Type	Description
messageId	String	Attribute used to reply to a chat message, just add the messageId of the message you want to reply to in this attribute
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
Request Body#
{
  "phone":"5511999998888", 
  "title" : "Google Brazil" , 
  "address" : "Av. Brg. Faria Lima, 3477 - Itaim Bibi, São Paulo - SP, 04538-133" , 
  "latitude": "-23.0696347",
  "longitude": "-50.4357913"
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-location");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\",\"title\": \"Google Brasil\",\"address\": \"Av. Brg. Faria Lima, 3477 - Itaim Bibi, São Paulo - SP, 04538-133\",\"latitude\": \"-23.0696347\",\"longitude\": \"-50.4357913\"}");

CURLcode ret = curl_easy_perform(hnd);

Send product
Method #
/send-product#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-product

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method allows you to send messages about your products. The product feature is only available for WhatsApp Business accounts . The account must also have registered products. Product-related operations can be found in the WhatsApp Business section of our documentation.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
catalogPhone	string	Phone number of the business account to which the product belongs.
productId	string	Product ID. Can be obtained from the product listing API or via webhook .
Request Body#
{
  "phone":"5511999999999", 
  "catalogPhone": "5511999999999",
  "productId": "7190654897637620"
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-product");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"catalogPhone\": \"5511999998888\", \"productId\": \"7190654897637620\"}");

CURLcode ret = curl_easy_perform(hnd);

Send catalog
Method #
/send-catalog#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-catalog

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method allows you to send messages with a link to your catalog. The catalog feature is only available for WhatsApp Business accounts . The account must also have products and a catalog configured. Operations related to products and collections can be found in the WhatsApp Business section of our documentation.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
catalogPhone	string	Phone number of the business account to which the catalog belongs.
Options #
Attributes	Type	Description
translation	string	Catalog card default message language (EN/PT).
message	string	Message sent with catalog card.
title	string	Catalog card title.
catalogDescription	string	Description sent in the catalog card.
Request Body#
{
  "phone":"5511999999999", 
  "catalogPhone":"5511999999999", 
  "translation": "PT",
  "message" : "Access this link to view our catalog on Whatsapp:" , 
  "title" : "See the product catalog on Whatsapp." , 
  "catalogDescription" : "Learn more about this company's products and services." 
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-catalog");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"catalogPhone\": \"5511999998888\"}");

CURLcode ret = curl_easy_perform(hnd);

Send contact
Method #
/send-contact#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-contact

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Simple and objective, this method allows you to send a contact, you don't need to have it in your contacts, just fill in the method attributes with contact information and send.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
contactName	string	Contact name
contactPhone	string	Phone number of the contact you want to share
Options #
Attributes	Type	Description
messageId	String	Attribute used to reply to a chat message, just add the messageId of the message you want to reply to in this attribute
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
contactBusinessDescription	string	Brief description about the contact (not displayed on WhatsApp web)
Request Body#
{
  "phone":"5511999999999", 
  "contactName": "Z-API Contato",
  "contactPhone": "554498398733"
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-contact");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"contactName\": \"Nome do contato\", \"contactPhone\": \"5511999999999\", \"contactBusinessDescription\": \"Breve descricao do contato\"}");

CURLcode ret = curl_easy_perform(hnd);

Send multiple contacts
Method #
/send-contacts#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-contacts

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Simple and objective, this method allows you to send multiple contacts, you don't need to have it in your contacts, just fill in the method attributes with contact information and send.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
contacts	array	Array of contacts to be sent
Contact Attributes #
Attributes	Type	Description
name	string	Contact name
phones	array	Contact numbers
businessDescription	string	Brief description about the contact (optional)
Options #
Attributes	Type	Description
messageId	String	Attribute used to reply to a chat message, just add the messageId of the message you want to reply to in this attribute
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
Request Body#
{
  "phone":"5544999999999", 
  "contacts": [
    {
      "name" : "Contact Name" , 
      "phones": ["5544999999999", "5544999999999"]
    },
    {
      "name" : "Contact Name" , 
      "phones": ["5544999999999"]
    },
    {
      "name" : "Contact Name" , 
      "businessDescription" : "An Irrah Group company" , 
      "phones":["5544999999999"] 
    }
  ]
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-contacts");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"contacts\": [{\"name\": \"Nome do contato\" , \"phones\": [\"5544999999999\",\"5544999999999\"], \"businessDescription\": \"Descrição do contato\"}]}");

CURLcode ret = curl_easy_perform(hnd);

Send text with action buttons
Method #
/send-button-actions#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-button-actions

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Attention
Button submissions are currently available, but there are some factors that determine how they work. For more details, see the Button Operation topic.

Conceptualization #
In this method, you can send text messages with action buttons, redirect to links, make calls, and also give standard responses.

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
message	string	Text to be sent
buttonActions	buttonActions[]	Array of objects of type buttonActions
buttonActions#
Attributes	Type	Description
type	string	Types of buttons to send (CALL, URL, REPLY)
phone	string	Number assigned to the button if it is of the CALL type
url	string	Link assigned to the button if it is a URL type.
label	string	Text for the button
Tip:
WhatsApp has a specific link to copy texts, passing this link in the url attribute, your button becomes a copy button ( https://www.whatsapp.com/otp/code/?otp_type=COPY_CODE&code=otpseucodigo )

Optional Button #
Attributes	Type	Description
id	string	Button identifier
Options #
Attributes	Type	Description
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
title	string	If you want to send a title
footer	string	If you want to send a footer
Observation
Currently, sending all three button types simultaneously generates an error on WhatsApp Web, which also occurs when using Meta's own API. An alternative is to send only the CALL and URL buttons together, and always send the REPLY button separately.

Request Body#
{
    "phone": "551199999999",
    "message" : "a message" , 
    "title" : "if you want to link a title" , 
    "footer" : "if you want to link a top footer" , 
    "buttonActions": [
        {
            "id": "1",
            "type": "CALL",
            "phone": "554498398733",
            "label" : "Contact us" 
        },
        {
            "id": "2",
            "type": "URL",
            "url": "https://z-api.io",
            "label" : "Visit our website" 
        }
    ]
}
{
    "phone":"551199999999", 
    "message" : "a message" , 
    "title" : "if you want to link a title" , 
    "footer" : "if you want to link a top footer" , 
    "buttonActions":[ 
        {
            "id": "3",
            "type": "REPLY",
            "label" : "Talk to attendant" 
        }
    ]
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-button-actions");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"554499999999\",\"message\": \"uma mensagem\",\"title\": \"se quiser vincular um titulo\",\"footer\": \"se quiser vincular um rodape top\",\"buttonActions\": [{\"id\": \"1\",\"type\": \"CALL\",\"phone\": \"+554498398733\",\"label\": \"Fale conosco\"},{\"id\": \"2\",\"type\": \"URL\",\"url\": \"https://z-api.io\",\"label\": \"Visite nosso site\"}]}");

CURLcode ret = curl_easy_perform(hnd);

Send text with buttons
Method #
/send-button-list#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-button-list

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Attention
Button submissions are currently available, but there are some factors that determine how they work. For more details, see the Button Operation topic.

Conceptualization #
In this method you can send text messages with action buttons, the content of the button e.g. YES / No, can be chosen by the user and will be used as a response to the message sent along with the buttons.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
message	string	Text to be sent
buttonList	buttonList	Button type object
important
The "message" attribute cannot be sent empty!

Options #
Attributes	Type	Description
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
Button List#
Attributes	Type	Description
buttons	button	list of buttons to be sent
Button#
Attributes	Type	Description
label	string	Text for the button
Optional Button #
Attributes	Type	Description
id	string	Button identifier
Request Body#
{
  "phone":"5511999999999", 
  "message" : "Is Z-API Good?" , 
  "buttonList": {
    "buttons": [
      {
        "id":"1", 
        "label" : "Great" 
      },
      {
        "id":"2", 
        "label" : "Excellent" 
      }
    ]
  }
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-button-list");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"message\": \"*Z-API* é Bom ?\",\"buttonList\": { \"buttons\": [ { \"id\": \"1\", \"label\": \"Ótimo\" }, { \"id\": \"2\", \"label\": \"Excelênte\" } ] }}");

CURLcode ret = curl_easy_perform(hnd);


Send buttons with image
Method #
/send-button-list#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-button-list

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Attention
Button submissions are currently available, but there are some factors that determine how they work. For more details, see the Button Operation topic.

Conceptualization #
In this method you can send images with action button options, the content of the button e.g. YES / No, can be chosen by the user and will be used as a response to the message sent along with the buttons.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
message	string	Text to be sent
buttonList	buttonList	Button type object
important
The "message" attribute cannot be sent empty!

Options #
Attributes	Type	Description
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
Button List#
Attributes	Type	Description
image	string	URL or Base64 of the image to be sent
buttons	button	list of buttons to be sent
Button#
Attributes	Type	Description
label	string	Text for the button
Optional Button #
Attributes	Type	Description
id	string	Button identifier
Request Body#
{
  "phone":"5511999999999", 
  "message" : "Is Z-API Good?" , 
  "buttonList":{ 
    "image": "https://avatars.githubusercontent.com/u/60630101?s=280&v=4",
    "buttons":[ 
      {
        "id":"1", 
        "label" : "Great" 
      },
      {
        "id":"2", 
        "label" : "Excellent" 
      }
    ]
  }
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-button-list");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"message\": \"*Z-API* é Bom ?\",\"buttonList\": { \"image\": \"URL ou Base64 da imagem\", \"buttons\": [ { \"id\": \"1\", \"label\": \"Ótimo\" }, { \"id\": \"2\", \"label\": \"Excelênte\" } ] }}");

CURLcode ret = curl_easy_perform(hnd);

Send buttons with video
Method #
/send-button-list#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-button-list

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Attention
Button submissions are currently available, but there are some factors that determine how they work. For more details, see the Button Operation topic.

Conceptualization #
In this method you can send images with action button options, the content of the button e.g. YES / No, can be chosen by the user and will be used as a response to the message sent along with the buttons.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
message	string	Text to be sent
buttonList	buttonList	Button type object
important
The "message" attribute cannot be sent empty!

Options #
Attributes	Type	Description
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
Button List#
Attributes	Type	Description
video	string	URL or Base64 of the video to be sent
buttons	button	list of buttons to be sent
Button#
Attributes	Type	Description
label	string	Text for the button
Optional Button #
Attributes	Type	Description
id	string	Button identifier
Request Body#
{
  "phone":"5511999999999", 
  "message" : "Is Z-API Good?" , 
  "buttonList":{ 
    "video": "url do video",
    "buttons":[ 
      {
        "id":"1", 
        "label" : "Great" 
      },
      {
        "id":"2", 
        "label" : "Excellent" 
      }
    ]
  }
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-button-list");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"message\": \"*Z-API* é Bom ?\",\"buttonList\": { \"video\": \"URL ou Base64 do video\", \"buttons\": [ { \"id\": \"1\", \"label\": \"Ótimo\" }, { \"id\": \"2\", \"label\": \"Excelênte\" } ] }}");

CURLcode ret = curl_easy_perform(hnd);


Method #
/send-option-list#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-option-list

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
In this method you can send text messages with a list of options, where the user can select one of the options sent.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
message	string	Text to be sent
optionList	optionList	List configuration
Options #
Attributes	Type	Description
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
Option List#
Attributes	Type	Description
title	string	Listing title
options	option	Options lists
buttonLabel	string	Text of the button that opens the list
Option#
Attributes	Type	Description
description	string	Option Description
title	string	Option title
Optional Button #
Attributes	Type	Description
id	string	Option identifier
Request Body#
{
  "phone":"5511999999999", 
  "message" : "Select the best option:" , 
  "optionList": {
    "title" : "Available Options" , 
    "buttonLabel" : "Open options list" , 
    "options": [
      {
        "id":"1", 
        "description" : "Z-API Wings for your imagination" , 
        "title": "Z-API"
      },
      {
        "id":"2", 
        "description" : "They don't work" , 
        "title" : "Others" 
      }
    ]
  }
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-option-list");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"message\": \"Selecione e melhor opção:\",\"optionList\": { \"title\": \"Opções disponíveis\", \"buttonLabel\": \"Abrir lista de opções\", \"options\": [ { \"id\": \"1\", \"description\": \"Z-API Asas para sua imaginação\", \"title\": \"Z-API\" }, { \"id\": \"2\", \"description\": \"Não funcionam\", \"title\": \"Outros\" } ] }}");

CURLcode ret = curl_easy_perform(hnd);

Send OTP button
Method #
/send-button-otp#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-button-otp

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Attention
Button submissions are currently available, but there are some factors that determine how they work. For more details, see the Button Operation topic.

Conceptualization #
In this method you can send text messages with a button to copy a value.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
message	string	Text to be sent
code	string	Value that will be copied when the button is clicked
Options #
Attributes	Type	Description
image	string	URL or Base64 of the image that will accompany the button
buttonText	string	Button text (example: "Click here to copy"). The default value is "Copy code".
Request Body#
{
  "phone":"551199999999", 
  "message" : "Message text" , 
  "code" : "Value to be copied" 
}

{
  "phone":"551199999999", 
  "message" : "Message text" , 
  "code" : "Value to be copied" , 
  "image" : "Image URL" , 
  "buttonText" : "Button Text" 
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-button-otp");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"554499999999\",\"message\": \"Message\",\"code\": \"123\"}");

CURLcode ret = curl_easy_perform(hnd);

Send PIX button
Method #
/send-button-pix#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-button-pix

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Attention
Button submissions are currently available, but there are some factors that determine how they work. For more details, see the Button Operation topic.

Conceptualization #
In this method you can send pix key messages with a copy button.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
pixKey	string	Pix key
type	string	Pix key type (CPF, CNPJ, PHONE, EMAIL, EVP)
Options #
Attributes	Type	Description
merchantName	string	Title to be displayed on the button (if sent empty, the default title will be 'Pix')
Request Body#
{
  "phone":"551199999999", 
  "pixKey" : "pix key" , 
  "type": "EVP"
}
Observation
On WhatsApp Web, received PIX messages don't change the chat status. The chat isn't marked as unread or moved to the top of the chat list. However, the message renders normally. This is a bug in WhatsApp Web itself.

Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-button-pix");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"554499999999\",\"pixKey\": \"pix key\",\"type\": \"EVP\"}");

CURLcode ret = curl_easy_perform(hnd);

Send carousel
Method #
/send-carousel#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-carousel

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Attention
Carousel button submissions are currently available, but there are some factors that determine how they work. For more details, see the Button Operation topic.

Conceptualization #
With this method, you can send carousel messages with images, text, and action buttons. From the action buttons, you can redirect to links, make calls, and also provide standard responses.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
message	string	Text to be sent
carousel	carouselCard[]	Array of objects with carousel cards
carouselCard#
Attributes	Type	Description
text	string	Card text
image	string	Card image
CarouselCard Options #
Attributes	Type	Description
buttons	buttonActions[]	Array of objects of type buttonActions
buttonActions#
Attributes	Type	Description
type	string	Types of buttons to send (CALL, URL, REPLY)
phone	string	Number assigned to the button if it is of the CALL type
url	string	Link assigned to the button if it is a URL type.
label	string	Text for the button
Optional buttonActions #
Attributes	Type	Description
id	string	Button identifier
Options #
Attributes	Type	Description
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
Request Body#
{
    "phone":"551199999999", 
    "message" : "Message text" , 
    "carousel": [
        {
            "text" : "Card text" , 
            "image":"https://firebasestorage.googleapis.com/v0/b/zaap-messenger-web.appspot.com/o/logo.png?alt=media", 
            "buttons":[ 
                {
                    "id":"1", 
                    "label" : "Button Name" , 
                    "url":"https://z-api.io", 
                    "type": "URL"
                },
                {
                    "id":"2", 
                    "label" : "Button Name" , 
                    "type": "REPLY"
                }
            ]
        },
        {
            "text" : "Card text" , 
            "image":"https://firebasestorage.googleapis.com/v0/b/zaap-messenger-web.appspot.com/o/logo.png?alt=media", 
            "buttons":[ 
                {
                    "id":"1", 
                    "label" : "Button Name" , 
                    "url":"https://z-api.io", 
                    "type":"URL" 
                },
                {
                    "id":"2", 
                    "label" : "Button Name" , 
                    "type":"REPLY" 
                }
            ]
        }
    ]
}
{
    "phone":"551199999999", 
    "message" : "Message text" , 
    "carousel":[ 
        {
            "text" : "Card text" , 
            "image": "https://firebasestorage.googleapis.com/v0/b/zaap-messenger-web.appspot.com/o/logo.png?alt=media"
        },
        {
            "text" : "Card text" , 
            "image":"https://firebasestorage.googleapis.com/v0/b/zaap-messenger-web.appspot.com/o/logo.png?alt=media" 
        }
    ]
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#


CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-carousel");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\":\"551199999999\",\"message\":\"Texto da mensagem\",\"carousel\":[{\"text\":\"Texto do cartão\",\"image\":\"https://firebasestorage.googleapis.com/v0/b/zaap-messenger-web.appspot.com/o/logo.png?alt=media\",\"buttons\":[{\"id\":\"1\",\"label\":\"Nome do botão\",\"url\":\"https://z-api.io\",\"type\":\"URL\"},{\"id\":\"2\",\"label\":\"Nome do botão\",\"type\":\"REPLY\"}]},{\"text\":\"Texto do cartão\",\"image\":\"https://firebasestorage.googleapis.com/v0/b/zaap-messenger-web.appspot.com/o/logo.png?alt=media\",\"buttons\":[{\"id\":\"1\",\"label\":\"Nome do botão\",\"url\":\"https://z-api.io\",\"type\":\"URL\"},{\"id\":\"2\",\"label\":\"Nome do botão\",\"type\":\"REPLY\"}]}]}");

CURLcode ret = curl_easy_perform(hnd);

Delete messages
Method #
/messages#
DELETE https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/messages

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method used to delete a message in a chat, you can delete both a message you sent and a message sent by a contact, to use this feature you will only need the messageId of the message you want to delete.

image

Attributes #
Mandatory #
Attributes	Type	Description
messageId	string	original message ID, in the case of a message sent by you it is the code that comes in your response, if it is a message sent by a contact you will receive this messageId through your receive webhook
phone	string	Telephone number (or group ID for sending to groups) of the recipient/sender in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
owner	boolean	Enter true if you sent the message or false if it is a received message.
Options #
Attributes	Type	Description
Request Params#
Example URL #
Method

DELETE

https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/messages?messageId=123&phone=5511999998888&owner=true

Response#
204#
No content

Attributes	Type	Description
Example

{}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "DELETE");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/messages?messageId=3999984263738042930CD6ECDE9VDWSA&phone=5511999998888&owner=true");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Read messages
Method #
/read-message#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/read-message

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method used to mark a message in a chat as read.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Telephone number (or group ID for sending to groups) of the recipient/sender in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
messageId	string	original message ID, in the case of a message sent by you it is the code that comes in your response, if it is a message sent by a contact you will receive this messageId through your receive webhook
Options #
Attributes	Type	Description
Request Body#
{
  "phone":"5511999998888", 
  "messageId": "3999984263738042930CD6ECDE9VDWSA"
}
Response#
204#
No content

Attributes	Type	Description
Example

{}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/read-message");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"messageId\": \"3999984263738042930CD6ECDE9VDWSA\"}");

CURLcode ret = curl_easy_perform(hnd);

Reply message
Method #
/send-text#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-text

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
In this topic we will talk a little about how to reply to a message directly!

When you use the send-text method there is an optional attribute called messageId , this is an attribute that receives the Id of any message, when this attribute is passed, your message will be directly related to the message with the informed Id.

tip
If you have any questions about how to send a text message, you can read about it in our Send Plain Text topic.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
message	string	Text to be sent
messageId	string	original message ID, in the case of a message sent by you it is the code that comes in your response, if it is a message sent by a contact you will receive this messageId through your receive webhook
Options #
Attributes	Type	Description
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
privateAnswer	boolean	In the case of a group message, this defines whether the reply will be sent to the group or to the sender's private message (this cannot be you). If you are the sender, the "privateAnswer" attribute will be ignored, sending the reply to the group itself.
Request Body#
{
  "phone":"5511999999999", 
  "message": "Welcome to *Z-API*",
  "messageId":"3999984263738042930CD6ECDE9VDWSA" 
}
{
  "phone": "342532456234453-group",
  "message":"Welcome to *Z-API*", 
  "messageId":"3999984263738042930CD6ECDE9VDWSA", 
  "privateAnswer": true
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-text");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"message\": \"Welcome to *Z-API*\", \"messageId\": \"Welcome to *Z-API*\"}");

CURLcode ret = curl_easy_perform(hnd);

Send poll
Method #
/send-poll#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-poll

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
In this method you can send poll type messages.

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
message	string	Text to be sent in the survey
poll	PollItem	Poll Options List
Options #
Attributes	Type	Description
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
pollMaxOptions	number	Maximum number of votes per person in the poll
PollItem #
Attributes	Type	Description
name	string	Option name
Request Body#
Multiple choices

{
  "phone":"5511999999999", 
  "message" : "What is the best API for WhatsApp?" , 
  "poll": [
    {"name": "Z-API"},  
    { "name" : "Other" } 
  ]
}

------------------------------------------------------

Single choice

{
  "phone":"5511999999999", 
  "message" : "What is the best API for WhatsApp?" , 
  "pollMaxOptions" : 1 , 
  "poll":[ 
    {"name":"Z-API"},   
    { "name" : "Other" } 
  ]
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-poll");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"message\": \"Qual a melhor API para WhatsApp?\", \"poll\": [ {  \"name\": \"Z-API\" }, { \"name\": \"Outros\" } ] }");

CURLcode ret = curl_easy_perform(hnd);

Submit vote to poll
Method #
/send-poll#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-poll-vote

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
In this method you will be able to vote in a specific poll.

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
pollMessageId	string	Poll message ID. IMPORTANT This is the message ID received when sending a poll or receiving one from another contact.
pollVote	pollVote	List of options that make up. IMPORTANT You can vote for more than one option.
PollVote #
Attributes	Type	Description
name	string	Option name
Request Body#
{
  "phone":"5511999999999", 
  "pollMessageId" : "poll message id" , 
  "pollVote" : [ 
    {"name": "Z-API"}
  ]
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-poll-vote");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"pollMessageId\": \"id da mensagem de enquete\", \"pollVote\": [ {  \"name\": \"Z-API\" } ] }");

CURLcode ret = curl_easy_perform(hnd);

Submit order approval
Method #
/send-order#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-order

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
With this method, you can send order messages containing products from your catalog or customized at the time of shipment. Remember that this message is the same one sent when you click the "Accept Order" or "Send Charge" button on a customer's order. This message returns order information to the webhook , as well as the data needed for status and payment updates . These, in turn, are also messages that reference the order's main message—the message sent from this route.

image

Important
This method is only available for WhatsApp Business accounts.

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number in DDI DDD NUMBER format. Ex: 551199999999. IMPORTANT: Send only numbers, without formatting or masking.
order	object	Order information to be shipped
paymentSettings	object	Payment settings (for cards to work, it must be configured in the WhatsApp account on your cell phone)
Object (order)

Attributes	Type	Description
currency	string	Currency code
products	array object	Product information related to the order
Object (products)

Attributes	Type	Description
name	string	Product name
value	number	Product value
quantity	number	Amount
Options #
Object (order)

Attributes	Type	Description
discount	number	Discount value
tax	number	Tax amount
shipping	number	Shipping cost
Object (products)

Attributes	Type	Description
productId	string	Catalog product ID
Object (paymentSettings)

Attributes	Type	Description
pix	object	PIX key information
card	object	Enable payment by card
Object (pix)

Attributes	Type	Description
key	string	PIX key
keyType	string	Key type (CPF, CNPJ, phone, email, randomKey)
name	string	Key name
Object (card)

Attributes	Type	Description
enabled	boolean	Enable payment by card
Request Body#
Including optional parameters #
{
    "phone": "554499999999",
    "order": {
        "currency": "BRL",
        "discount": 10,
        "tax": 10,
        "shipping": 5,
        "products": [
            {
                "productId": "23940797548900636",
                "name" : "Product Name" , 
                "value": 10,
                "quantity": 2
            }
        ]
    },
    "paymentSettings": {
        "pix": {
            "key" : "PIX Key" , 
            "keyType" : "Key type (cpf | cnpj | phone | email | randomKey)" , 
            "name" : "Key name" 
        },
        "card": {
            "enabled": true
        }
    }
}
Only mandatory parameters #
{
    "phone": "554499999999",
    "order": {
        "currency": "BRL",
        "products": [
            {
                "name" : "Product Name" , 
                "value": 150,
                "quantity": 1
            }
        ]
    }
}
Tip
When sending a product in the "products" list without the "productId" attribute, it is characterized as a "custom" product. It receives an ID to be used in the context of this order, which is returned in the ReceivedCallback webhook and should be used for order status updates.

Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-order");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"554499999999\",\"order\": {\"currency\": \"BRL\",\"products\": [{\"name\": \"Order name\",\"value\": 150,\"quantity\": 1}]}}");

CURLcode ret = curl_easy_perform(hnd);

Send order status update
Method #
/order-status-update#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/order-status-update

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
In this method you can send status update messages for orders sent.

image

Important
This method is only available for WhatsApp Business accounts.

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number in DDI DDD NUMBER format. Ex: 551199999999. IMPORTANT: Send only numbers, without formatting or masking.
messageId	string	WhatsApp ID of the original order message
referenceId	string	Order reference ID (returned in webhook )
orderRequestId	string	Order request reference ID (returned in webhook )
orderStatus	string	Novo status do pedido (pending, processing, shipped, completed, canceled)
paymentStatus	string	Current payment status (pending, paid) (returned in the webhook )
order	object	Order information to be shipped
Object (order)

Attributes	Type	Description
currency	string	Currency code
products	array object	Product information related to the order
Object (products)

Attributes	Type	Description
productId	string	Product ID (returned in webhook )
name	string	Product name
value	number	Product value
quantity	number	Amount
isCustomItem	boolean	Informs whether it is a customized product at the time of shipping (returned in the webhook )
Options #
Attributes	Type	Description
message	string	Message text
Object (order)

Attributes	Type	Description
discount	number	Discount value
tax	number	Tax amount
shipping	number	Shipping cost
Request Body#
Attention
It is necessary to send in the request all the data previously informed when sending the order, with the inclusion of some additional mandatory parameters, which are returned in the webhook

{
    "phone":"554499999999", 
    "messageId": "3EB0F91BBA791BB0A787FC",
    "message" : "Order update text message" , 
    "referenceId": "4N8FCTW1WM6",
    "orderRequestId": "4N8FCTW22W4",
    "orderStatus": "processing",
    "paymentStatus": "pending",
    "order":{ 
        "currency":"BRL", 
        "discount":10, 
        "tax":10, 
        "shipping":5, 
        "products":[ 
            {
                "value":150, 
                "quantity": 2,
                "name": "order 1",
                "isCustomItem": true,
                "productId": "custom-item-4N8FCTW23N7"
            },
            {
                "productId":"23940797548900636", 
                "value":150, 
                "quantity":2, 
                "name": "order 2",
                "isCustomItem": false
            }
        ]
    }
}
Tip
You may notice that the product with the "isCustomItem" attribute set to true has an ID prefixed with "custom-item." This occurs when no product ID is provided when submitting an order, meaning WhatsApp assumes it is a customized product. This ID is returned in the webhook and is a required parameter, along with "isCustomItem," for order updates.

Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/order-status-update");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"554498161272\",\"messageId\": \"3EB0F91BBA791BB0A787FC\",\"referenceId\": \"4N8FCTW1WM6\",\"orderRequestId\": \"4N8FCTW22W4\",\"orderStatus\": \"processing\",\"paymentStatus\": \"pending\",\"order\": {\"currency\": \"BRL\",\"discount\": 10,\"tax\": 10,\"shipping\": 5,\"products\": [{\"value\": 150,\"quantity\": 2,\"name\": \"order 1\",\"isCustomItem\": true,\"productId\": \"custom-item-4N8FCTW23N7\"},{\"productId\": \"23940797548900636\",\"value\": 150,\"quantity\": 2,\"name\": \"order 2\",\"isCustomItem\": false}]}}");

CURLcode ret = curl_easy_perform(hnd);

Send order payment update
Method #
/order-payment-update#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/order-payment-update

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
With this method, you can send payment update messages for orders sent.

image

Important
This method is only available for WhatsApp Business accounts.

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number in DDI DDD NUMBER format. Ex: 551199999999. IMPORTANT: Send only numbers, without formatting or masking.
messageId	string	WhatsApp ID of the original order message
referenceId	string	Order reference ID (returned in webhook )
orderRequestId	string	Order request reference ID (returned in webhook )
orderStatus	string	Current order status (pending, processing, shipped, completed, canceled) (returned in the webhook )
paymentStatus	string	New payment status (pending, paid)
order	object	Order information to be shipped
Object (order)

Attributes	Type	Description
currency	string	Currency code
products	array object	Product information related to the order
Object (products)

Attributes	Type	Description
productId	string	Product ID (returned in webhook )
name	string	Product name
value	number	Product value
quantity	number	Amount
isCustomItem	boolean	Informs whether it is a customized product at the time of shipping (returned in the webhook )
Options #
Attributes	Type	Description
message	string	Message text
Object (order)

Attributes	Type	Description
discount	number	Discount value
tax	number	Tax amount
shipping	number	Shipping cost
Request Body#
Attention
It is necessary to send in the request all the data previously informed when sending the order, with the inclusion of some additional mandatory parameters, which are returned in the webhook

{
    "phone":"554499999999", 
    "messageId":"3EB0F91BBA791BB0A787FC", 
    "message" : "Order update text message" , 
    "referenceId":"4N8FCTW1WM6", 
    "orderRequestId":"4N8FCTW22W4", 
    "orderStatus":"processing", 
    "paymentStatus": "paid",
    "order":{ 
        "currency":"BRL", 
        "discount":10, 
        "tax":10, 
        "shipping":5, 
        "products":[ 
            {
                "value":150, 
                "quantity":2, 
                "name":"order 1", 
                "isCustomItem":true, 
                "productId":"custom-item-4N8FCTW23N7" 
            },
            {
                "productId":"23940797548900636", 
                "value":150, 
                "quantity":2, 
                "name":"order 2", 
                "isCustomItem":false 
            }
        ]
    }
}
Tip
You may notice that the product with the "isCustomItem" attribute set to true has an ID prefixed with "custom-item." This occurs when no product ID is provided when submitting an order, meaning WhatsApp assumes it is a customized product. This ID is returned in the webhook and is a required parameter, along with "isCustomItem," for order updates.

Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/order-payment-update");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"554498161272\",\"messageId\": \"3EB0F91BBA791BB0A787FC\",\"referenceId\": \"4N8FCTW1WM6\",\"orderRequestId\": \"4N8FCTW22W4\",\"orderStatus\": \"processing\",\"paymentStatus\": \"paid\",\"order\": {\"currency\": \"BRL\",\"discount\": 10,\"tax\": 10,\"shipping\": 5,\"products\": [{\"value\": 150,\"quantity\": 2,\"name\": \"order 1\",\"isCustomItem\": true,\"productId\": \"custom-item-4N8FCTW23N7\"},{\"productId\": \"23940797548900636\",\"value\": 150,\"quantity\": 2,\"name\": \"order 2\",\"isCustomItem\": false}]}}");

CURLcode ret = curl_easy_perform(hnd);

Pin/Unpin messages
Method #
/pin-message#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/pin-message

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
In this method, you can pin messages from a conversation, whether private chats or groups.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
messageId	string	ID of the message to be pinned or unpinned
messageAction	string	Action that will be performed for the message: pinned or unpinned (pin, unpin)
pinMessageDuration	string	The length of time the message will remain pinned. This has no effect if you unpin a message.
Request Body#
{
  "phone":"5511999999999", 
  "messageId": "77DF5293EBC176FFA6A88838E7A6AD83",
  "messageAction": "pin | unpin",
  "pinMessageDuration": "24_hours | 7_days | 30_days"
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/pin-message");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"messageId\": \"77DF5293EBC176FFA6A88838E7A6AD83\", \"messageAction\": \"pin\", \"pinMessageDuration\": \"7_days\"}");

CURLcode ret = curl_easy_perform(hnd);

Send channel admin invite
Method #
/send-newsletter-admin-invite#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-newsletter-admin-invite

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
With this method, you can send messages inviting people to be administrators of your WhatsApp channels.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number in DDI DDD NUMBER format. Ex: 551199999999. IMPORTANT: Send only numbers, without formatting or masking.
adminInviteMessage	object	Object with the data necessary to send the invitation message
Object (adminInviteMessage)

Attributes	Type	Description
newsletterId	string	ID of the channel to which the invitation belongs. Ex: 999999999999999999@newsletter.
caption	object	Invitation message text
Request Body#

{
  "phone":"5511999999999", 
  "adminInviteMessage": { 
    "newsletterId": "120363166555745933@newsletter",
    "caption" : "I want to invite you to be an admin of my WhatsApp channel." 
  }
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Webhook

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-newsletter-admin-invite");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "accept: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"adminInviteMessage\": {\"newsletterId\": \"120363166555745933@newsletter\", \"caption\": \"Message text\"}}");

CURLcode ret = curl_easy_perform(hnd);

Send event
Method #
/send-event#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-event

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method allows you to send Event-type messages. This type can only be sent to a group.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
event	Event	Event data
Event#
Attributes	Type	Description
name	string	Nome do event
description	string (opcional)	Event Description
dateTime	string	Date and time of event (no timezone)
location	Location (opcional)	Event location
callLinkType	string (voice/video) (opcional)	Event call type (voice or video)
canceled	boolean	Defines whether the event is canceled
Request Body#
{
  "phone": "120363019502650977-group",
  "event": {
    "name" : "Event Name" , 
    "description" : "Event Description" , 
    "dateTime": "2024-04-29T09:30:53.309Z",
    "location": {
      "name" : "Name of place" 
    },
    "callLinkType": "voice | video",
    "canceled": false
  }
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-event");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"event\": { \"name\": \"Example event\", \"description\": \"Example description\", \"dateTime\": \"2024-04-29T08:30:53.309Z\", \"location\": { \"name\": \"Location name\" }, \"callLinkType\": \"voice\", \"canceled\": false } }");

CURLcode ret = curl_easy_perform(hnd);

Edit event
Method #
/send-edit-event#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-edit-event

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
In this method you can send Event editing messages.

tip
To edit the event, you must resubmit the data already configured for the event, even if it hasn't been changed. Failure to submit this data may result in it being removed from the event.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
event	Event	Event data
eventMessageId	string	Original event message ID
Event#
Attributes	Type	Description
name	string	Nome do event
description	string (opcional)	Event Description
dateTime	string	Date and time of the event
location	Location (opcional)	Event location
callLinkType	string (voice/video) (opcional)	Event call type (voice or video)
canceled	boolean	Defines whether the event is canceled
Request Body#
{
  "phone":"120363019502650977-group", 
  "eventMessageId" : "3EB058359730B7C2895C55" , 
  "event":{ 
    "name" : "New event name" , 
    "description" : "Event Description" , 
    "dateTime":"2024-04-29T09:30:53.309Z", 
    "location":{ 
      "name" : "Name of place" 
    },
    "callLinkType":"voice | video", 
    "canceled":false 
  }
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-edit-event");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"eventMessageId\": \"3EB05669C7C3B9B27A6595\", \"event\": { \"name\": \"Example event\", \"description\": \"Example description\", \"dateTime\": \"2024-04-29T08:30:53.309Z\", \"location\": { \"name\": \"Location name\" }, \"canceled\": false } }");

CURLcode ret = curl_easy_perform(hnd);

Respond to event
Method #
/send-event-response#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-event-response

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
In this method you can send response messages to an event.

tip
You can't respond to an event you created yourself. In this case, your response will always be "attendance confirmed."

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number (or group ID for sending to groups) in the format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
eventResponse	string	Response to event (GOING, NOT_GOING)
eventMessageId	string	Original event message ID
Request Body#
{
  "phone":"120363019502650977-group", 
  "eventMessageId" : "D2D612289D9E8F62307D72409A8D9DC3" , 
  "eventResponse": "GOING"
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-event-response");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"eventMessageId\": \"3EB05669C7C3B9B27A6595\", \"eventResponse\": \"GOING\" }");

CURLcode ret = curl_easy_perform(hnd);

Introduction
Conceptualization #
In this topic, you will learn about all the available methods for privacy settings.

WhatsApp's privacy settings are a set of options and features that allow users to control who can access and interact with their personal information on the messaging app. These settings aim to protect users' privacy and provide control over information sharing. Key privacy settings include the ability to control who can see your profile picture , last seen information , and confirm read messages .

List disallowed contacts
Method #
/privacy/disallowed-contacts#
GET https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/privacy/disallowed-contacts?type=ESCOPO_DO_BLOQUEIO

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Using this method, you can blacklist contacts for certain interactions with your account.

Attributes #
Mandatory #
Attributes	Type	Description
type	string	Block scope (lastSeen, photo, description, groupAdd)
String (type)

Block scope. Accepted values:

lastSeen
photo (View profile photo)
description (View message)
groupAdd (Permission to add to groups)
Request Params#
Example URL #
Method

GET https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/disallowed-contacts?type=lastSeen

Response#
200#
Attributes	Type	Description
disallowedContacts	array string	Phone number of each blacklisted contact
Example

{
    "disallowedContacts": [
        "554411111111",
        "554422222222"
    ]
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/privacy/disallowed-contacts?type=lastSeen");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

ast seen
Method #
/privacy/last-seen#
POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/privacy/last-seen

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Using this method, you can configure who can see your "last seen".

Attributes #
Mandatory #
Attributes	Type	Description
visualizationType	string	Display scope (ALL, NONE, CONTACTS, CONTACT_BLACKLIST)
String (visualizationType)

Viewing scope. Accepted values:

ALL (Everyone can see)
NONE (Nobody can see)
CONTACTS (Only my contacts)
CONTACT_BLACKLIST (Only my contacts, except...)
Optional #
Attributes	Type	Description
contactsBlacklist	array object	Contacts to be added or removed from the blacklist. Must be sent when "visualizationType" is "CONTACT_BLACKLIST"
Array Object (contactsBlacklist)

Attributes	Type	Description
action	string	Action to be performed for the contact; add or remove from the blacklist (add, remove)
phone	string	Contact number
Request Body#
Method

POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/privacy/last-seen

Example

{
    "visualizationType": "ALL"
}
{
    "visualizationType": "CONTACT_BLACKLIST",
    "contactsBlacklist": [
        { "action": "add", "phone": "554411111111" },
        { "action": "remove", "phone": "554422222222" }
    ]
}
Important
It is important to highlight that the blacklist (list of not allowed contacts) is different for each privacy setting, that is, the "last seen" blacklist is not the same as the "profile photo", and so on for all settings that accept the blacklist.

Tip
It is not necessary to resend the "contactsBlacklist" attribute with the contacts already added. This parameter is only for changes to the blacklist .

Response#
200#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
Example

{
    "success":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/privacy/last-seen");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"visualizationType\": \"CONTACT_BLACKLIST\", \"contactsBlacklist\": [{\"action\": \"add\", \"phone\": \"554411111111\"}, {\"action\": \"remove\", \"phone\": \"554422222222\"}]}");

CURLcode ret = curl_easy_perform(hnd);

Profile photo view
Method #
/privacy/photo#
POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/privacy/photo

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Using this method, you can configure who can see your profile picture.

Attributes #
Mandatory #
Attributes	Type	Description
visualizationType	string	Display scope (ALL, NONE, CONTACTS, CONTACT_BLACKLIST)
String (visualizationType)

Viewing scope. Accepted values:

ALL (Everyone can see)
NONE (Nobody can see)
CONTACTS (Only my contacts)
CONTACT_BLACKLIST (Only my contacts, except...)
Optional #
Attributes	Type	Description
contactsBlacklist	array object	Contacts to be added or removed from the blacklist. Must be sent when "visualizationType" is "CONTACT_BLACKLIST"
Array Object (contactsBlacklist)

Attributes	Type	Description
action	string	Action to be performed for the contact; add or remove from the blacklist (add, remove)
phone	string	Contact number
Request Body#
Method

POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/privacy/photo

Example

{
    "visualizationType":"ALL" 
}
{
    "visualizationType":"CONTACT_BLACKLIST", 
    "contactsBlacklist":[ 
        {"action":"add","phone":"554411111111"},     
        {"action":"remove","phone":"554422222222"}     
    ]
}
Important
It is important to highlight that the blacklist (list of not allowed contacts) is different for each privacy setting, that is, the "last seen" blacklist is not the same as the "profile photo", and so on for all settings that accept the blacklist.

Tip
It is not necessary to resend the "contactsBlacklist" attribute with the contacts already added. This parameter is only for changes to the blacklist .

Response#
200#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
Example

{
    "success":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/privacy/photo");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"visualizationType\": \"CONTACT_BLACKLIST\", \"contactsBlacklist\": [{\"action\": \"add\", \"phone\": \"554411111111\"}, {\"action\": \"remove\", \"phone\": \"554422222222\"}]}");

CURLcode ret = curl_easy_perform(hnd);

Message preview
Method #
/privacy/description#
POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/privacy/description

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Using this method, you can configure who can see your profile message.

Attributes #
Mandatory #
Attributes	Type	Description
visualizationType	string	Display scope (ALL, NONE, CONTACTS, CONTACT_BLACKLIST)
String (visualizationType)

Viewing scope. Accepted values:

ALL (Everyone can see)
NONE (Nobody can see)
CONTACTS (Only my contacts)
CONTACT_BLACKLIST (Only my contacts, except...)
Optional #
Attributes	Type	Description
contactsBlacklist	array object	Contacts to be added or removed from the blacklist. Must be sent when "visualizationType" is "CONTACT_BLACKLIST"
Array Object (contactsBlacklist)

Attributes	Type	Description
action	string	Action to be performed for the contact; add or remove from the blacklist (add, remove)
phone	string	Contact number
Request Body#
Method

POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/privacy/description

Example

{
    "visualizationType":"ALL" 
}
{
    "visualizationType":"CONTACT_BLACKLIST", 
    "contactsBlacklist":[ 
        {"action":"add","phone":"554411111111"},     
        {"action":"remove","phone":"554422222222"}     
    ]
}
Important
It is important to highlight that the blacklist (list of not allowed contacts) is different for each privacy setting, that is, the "last seen" blacklist is not the same as the "profile photo", and so on for all settings that accept the blacklist.

Tip
It is not necessary to resend the "contactsBlacklist" attribute with the contacts already added. This parameter is only for changes to the blacklist .

Response#
200#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
Example

{
    "success":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/privacy/description");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"visualizationType\": \"CONTACT_BLACKLIST\", \"contactsBlacklist\": [{\"action\": \"add\", \"phone\": \"554411111111\"}, {\"action\": \"remove\", \"phone\": \"554422222222\"}]}");

CURLcode ret = curl_easy_perform(hnd);

Permission to add to groups
Method #
/privacy/group-add#
POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/privacy/group-add

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Using this method, you can configure who can add you to groups.

Attributes #
Mandatory #
Attributes	Type	Description
type	string	Permission scope (ALL, CONTACTS, CONTACT_BLACKLIST)
String (type)

Permission scope. Accepted values:

ALL (Everyone can add)
CONTACTS (Only my contacts)
CONTACT_BLACKLIST (Only my contacts, except...)
Optional #
Attributes	Type	Description
contactsBlacklist	array object	Contacts to be added or removed from the blacklist. Must be sent when the "type" is "CONTACT_BLACKLIST"
Array Object (contactsBlacklist)

Attributes	Type	Description
action	string	Action to be performed for the contact; add or remove from the blacklist (add, remove)
phone	string	Contact number
Request Body#
Method

POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/privacy/group-add

Example

{
    "type": "ALL"
}
{
    "type": "CONTACT_BLACKLIST",
    "contactsBlacklist":[ 
        {"action":"add","phone":"554411111111"},     
        {"action":"remove","phone":"554422222222"}     
    ]
}
Important
It is important to highlight that the blacklist (list of not allowed contacts) is different for each privacy setting, that is, the "last seen" blacklist is not the same as the "profile photo", and so on for all settings that accept the blacklist.

Tip
It is not necessary to resend the "contactsBlacklist" attribute with the contacts already added. This parameter is only for changes to the blacklist .

Response#
200#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
Example

{
    "success":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/privacy/group-add");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"type\": \"CONTACT_BLACKLIST\", \"contactsBlacklist\": [{\"action\": \"add\", \"phone\": \"554411111111\"}, {\"action\": \"remove\", \"phone\": \"554422222222\"}]}");

CURLcode ret = curl_easy_perform(hnd);


Method #
/privacy/online#
POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/privacy/online

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Using this method, you can configure who can see you when you are online.

Attributes #
Mandatory #
Attributes	Type	Description
visualizationType	string	Display scope (ALL, SAME_LAST_SEEN)
String (visualizationType)

Viewing scope. Accepted values:

ALL (Everyone can see)
SAME_LAST_SEEN (Same setting used in "last seen")
Request Body#
Method

POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/privacy/online

Example

{
    "visualizationType":"ALL" 
}
Response#
200#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
Example

{
    "success":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/privacy/online");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"visualizationType\": \"SAME_LAST_SEEN\"}");

CURLcode ret = curl_easy_perform(hnd);

Read receipts
Method #
/privacy/read-receipts#
POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/privacy/read-receipts?value=VALOR_DA_CONFIGURAÇÃO

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Using this method, you can configure message read receipts (not applicable to groups).

Attributes #
Mandatory #
Attributes	Type	Description
value	string	Enable or disable read receipts (enable, disable)
String (value) accepted values:

enable (Enables read receipts)
disable (Disables read receipts)
Request Params#
Example URL #
Method

POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/privacy/read-receipts?value=enable

Important
By disabling read receipts , you also cannot see whether your messages have been read.

Response#
200#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
Example

{
    "success":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/privacy/read-receipts?value=enable");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Message duration
Method #
/privacy/messages-duration#
POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/privacy/messages-duration?value=VALOR_DA_DURAÇÃO

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method allows you to set up temporary messages for new individual conversations , setting a duration. It doesn't affect existing conversations.

Attributes #
Mandatory #
Attributes	Type	Description
value	string	Message duration time (days90, days7, hours24, disable)
String (value) accepted values:

days90 (Sets message duration to 90 days)
days7 (Sets message duration to 7 days)
hours24 (Sets message duration to 24 hours)
disable (Disables message expiration)
Request Params#
Example URL #
Method

POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/privacy/messages-duration?value=days90

Response#
200#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
Example

{
    "success":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/privacy/messages-duration?value=days90");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Introduction
Conceptualization #
In this topic, you will understand a little more about what Z-API can do when it comes to contact. We have divided this approach into some topics listed below to better explain it to you:

For WhatsApp, every contact is simply a chat! It seems bold to say, but that's how it treats what we call a contact. It uses your contact's number only as an identifier for the chat, as mentioned in other topics. But then, what's the difference between get-chats and get-contacts? Get-chats will bring up all contacts with whom you've already had a conversation—that is, have an open chat with them. Get-contacts will return all your contacts who have a WhatsApp account, plus contacts who participate in groups with your number.

Everything that Z-API can do regarding contacts is the same as what WhatsApp Web can do, that is, almost nothing, it is not possible to add a contact, not even rename or even delete it, basically what you need to understand is that WhatsApp Web cannot manipulate your cell phone's contact list, so Z-API cannot either.

About contacts
The method that returns contacts may leave you a little confused because it will probably return a greater number of contacts than the amount you have in your address book, this is because you probably participate in groups, the get-contacts method will return all the contacts that are in the groups you participate in.

Get contacts
Method #
/contacts#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/contacts

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method returns all your WhatsApp contacts. Remember what we said in the introduction about contact numbers. If you missed this section, I suggest you go back and read our introduction to contacts.

Attributes #
Mandatory #
Attributes	Type	Description
page	integer	Used for pagination, you must inform here the contact page you want to search for.
pageSize	integer	Specifies the size of the contact return per page
Options #
Attributes	Type	Description
Request Params#
Example URL #
Method

GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/contacts?page=1&pageSize=20

Response#
200#
Attributes	Type	Description
phone	string	Contact phone number
name	string	Contact's first and last name will only be returned if you have the number in your contacts
short	string	Contact name , will only be returned if you have the number in your contacts
ignite	string	Contact name if you have them as a contact
notify	string	Name provided in WhatsApp name settings
Example

[
  {
    "name" : "First and last name of contact 1" , 
    "short" : "Contact Name 1" , 
    "notify" : "WhatsApp Name 1" , 
    "vname" : "Name no vcard" , 
    "phone": "559999999999"
  }
]
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/contacts?page=1&pageSize=100");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Add Contacts
Method #
/contacts/add#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/contacts/add

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for saving Whatsapp contacts to your cell phone contact list.

About This Feature
The method for adding contacts to your WhatsApp list will only work for accounts that have already received the necessary update. Make sure your WhatsApp account has received the update before using this feature. Otherwise, the operation will not be successful.

Additionally, you need to allow WhatsApp to add contacts directly to your phone. To do this, go to your app's privacy settings and adjust the permissions so that WhatsApp can access and modify your contacts.

See the example in the images below:

Click here to view images
Attributes #
Mandatory #
Attributes	Type	Description
firstName	string	Name of the contact that will be added to the address book
phone	string	Number of the contact that will be added to the address book
Options #
Attributes	Type	Description
lastName	string	Last name of the contact to be added to the address book
Request Body#
[
  {
    "firstName" : "Contact 1" , 
    "lastName" : "Last Name 1" , 
    "phone": "554499999999"
  },
  {
    "firstName" : "Contact 2" , 
    "lastName" : "Last Name 2" , 
    "phone": "554499998888"
  }
]
Response#
200#
Attributes	Type	Description
success	boolean	
errors	array	
Example

{
    "success":true, 
    "errors": []
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/contacts/add");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "[{\"firstName\": \"Contato 1\", \"lastName\": \"Sobrenome 1\", \"phone\": \"554499999999\"}, {\"firstName\": \"Contato 2\", \"lastName\": \"Sobrenome 2\", \"phone\": \"554499998888\"}]");

CURLcode ret = curl_easy_perform(hnd);

Remove Contacts
Method #
/contacts/remove#
DELETE https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/contacts/remove

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for removing Whatsapp contacts from your cell phone contact list.

About This Feature
The method for removing contacts from your WhatsApp list will only work for accounts that have already received the necessary update. Make sure your WhatsApp account has received the update before using this feature. Otherwise, the operation will not be successful.

Request Body#
[
  "554499999999",
  "554499998888"
]
Response#
200#
Attributes	Type	Description
success	boolean	
errors	array	
Example

{
    "success":true, 
    "errors":[] 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "DELETE");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/contacts/remove");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "[\"554499999999\",\"554499998888\"]");

CURLcode ret = curl_easy_perform(hnd);

Get contact metadata
Method #
/contacts/{phone}#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/contacts/{phone}

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for returning the contact metadata information.

Contact image tip
If you want to store your contact's image, please note that we always return the imgUrl attribute with it to you in get-contacts. However, it's important to remember that it's only available for 48 hours ; after that, the image link is deleted by WhatsApp. We suggest that if you need to update your contact's image, you use the next method in this documentation, get-profile-picture .

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number in DDI DDD NUMBER format. Ex: 551199999999. IMPORTANT: Send only numbers, without formatting or masking.
Options #
Attributes	Type	Description
Request Params#
Example URL #
Method

GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/contacts/5511999999999

Response#
200#
Attributes	Type	Description
phone	string	Contact phone number
name	string	Contact's first and last name will only be returned if you have the number in your contacts
short	string	Contact name , will only be returned if you have the number in your contacts
ignite	string	Contact's Vcard name, if any
notify	string	Name provided in WhatsApp name settings
imgUrl	string	WhatsApp deletes contact photo URL after 48 hours
Example

{
  "name" : "Contact's first and last name" , 
  "phone":"551199999999", 
  "notify" : "WhatsApp contact name" , 
  "short" : "Contact Name" , 
  "imgUrl" : "contact photo url" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/contacts/5511999999999");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Get contact image
Method #
/profile-picture#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/profile-picture

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for returning the URL with the updated contact image.

As already mentioned in the previous topic, remember

If you want to store your contact's image, please note that we always return the imgUrl attribute with it to you in get-contacts. However, it's important to remember that it's only available for 48 hours ; after that, the image link is deleted by WhatsApp. We suggest that if you need to update your contact's image, you use the next method in this documentation, profile-picture .

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number in DDI DDD NUMBER format. Ex: 551199999999. IMPORTANT: Send only numbers, without formatting or masking.
Options #
Attributes	Type	Description
Request Params#
Example URL #
Method

GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/profile-picture?phone=551199999999

Response#
200#
Attributes	Type	Description
link	string	Url with contact photo
Example

[
  {
    "link" : "Url with contact photo" 
  }
]
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/profile-picture?phone=5511999999999&Client-Token=%7B%7Bsecurity-token%7D%7D");

CURLcode ret = curl_easy_perform(hnd);

Number with WhatsApp?
Method #
/phone-exists#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/phone-exists

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method returns whether or not the number has WhatsApp.

Important
Use this API whenever you want to check if a number has WhatsApp, typically for form validation. Do not use this API if you want to verify before sending a message, as Z-API already validates the number's existence with each message sent. Using this method for this purpose can cause problems, as verification would be duplicated. Z-API was not developed to spread spam to contacts you don't know, so use it wisely!

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number in DDI DDD NUMBER format. Ex: 551199999999. IMPORTANT: Send only numbers, without formatting or masking.
Options #
Attributes	Type	Description
Request Params#
Example URL #
Method

GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/phone-exists/5511999999999

Response#
200#
Attributes	Type	Description
exists	boolean	true if it exists and false if the number does not have WhatsApp
Example

[
  {
    "exists" : "true or false" 
  }
]
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/phone-exists/5511999999999");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);


Method #
/phone-exists-batch#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/phone-exists-batch

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Unlike the previous method, which individually validates whether a number has WhatsApp through a GET request, this API offers a batch verification.

Attention
Limit per Request: The maximum number of batch validations per request is 50,000 numbers.

Important
This method remains the ideal choice when you need to verify that a number has WhatsApp, especially useful for form validation. However, it's crucial to note that using this API to verify the number's existence before sending a message is not recommended. The Z-API already performs this validation automatically for every message sent, and using this method twice can result in issues.

Attributes #
Mandatory #
Attributes	Type	Description
phones	array	Telephone numbers to be validated, format DDI DDD NUMBER Ex: 551199999999. IMPORTANT Send only numbers, without formatting or masking
Request Params#
Example URL #
Method

POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/phone-exists-batch

{
  "phones": ["554499999999","554488888888"]
}
Response#
200#
Attributes	Type	Description
exists	boolean	true if it exists and false if the number does not have WhatsApp
inputPhone	string	Number sent in the request, which may or may not contain the ninth digit.
outputPhone	string	Number formatted according to WhatsApp's response, reflecting WhatsApp registration and including the ninth digit, if applicable.
Example

[
    {
        "exists": true,
        "inputPhone": "554499999999",
        "outputPhone": "554499999999"
    },
    {
        "exists": false,
        "inputPhone": "554488888888",
        "outputPhone": "554488888888"
    }
]
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/phone-exists-batch");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phones\": [\"5511999999999\", \"554499999999\"]}}");

CURLcode ret = curl_easy_perform(hnd);

Block contact
Method #
/contacts/modify-blocked#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/contacts/modify-blocked

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for blocking or unblocking a contact.

Attributes #
Mandatory #
Attributes	Type	Description
phone	integer	Phone number you want to change in YOUR chat
action	string	Attribute to block or unblock the contact (block or unblock)
Request Body#
Example

{
  "phone":"5544999999999", 
  "action": "block" ou "unblock"
}
Response#
200#
Attributes	Type	Description
value	boolean	Action confirmation attribute
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/contacts/modify-blocked");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5544999999999\", \"action\": \"block / unblock\"}");

CURLcode ret = curl_easy_perform(hnd);

Report contact
Method #
/contacts/{{phone}}/report#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/contacts/{{phone}}/report

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for reporting a contact.

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Phone number you want to report
Request Params#
Example URL #
Method

POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/contacts/5544999999999/report

Response#
200#
Attributes	Type	Description
success	boolean	Action confirmation attribute (true, false)
error	string	Error message, if it occurs
Example

{
  "success":true 
}
400#
{
    "error": "Invalid phone"
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/contacts/5544999999999/report");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Introduction
Conceptualization #
As we mentioned in the previous topic for WhatsApp, everything is a chat, in this topic you will find all the methods to search for information about your chats.

Get chats
Method #
/chats#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/chats

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for returning all chats.

Attributes #
Mandatory #
Attributes	Type	Description
page	integer	Used for pagination, you can enter here the chat page you want to search for.
pageSize	integer	Specifies the size of chat returns per page
Options #
Attributes	Type	Description
Request Params#
Example URL #
Method

GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/chats

Response#
200#
Attributes	Type	Description
archived	boolean	true or false indicates whether the chat is archived
pinned	boolean	true or false indicates whether the chat is pinned
phone	string	Contact phone number
unread	string	indicates the number of unread messages in a chat
name	string	Name given to the chat, remembering that if it is a group or broadcast list you must return the respective IDs
lastMessageTime	string	Timestamp with the date and time of the last interaction with the chat
muteEndTime	string	Timestamp with the date and time the notification will be reactivated (-1 is forever)
isMuted	string	0 or 1 indicates whether or not you muted this chat
isMarketSpam	boolean	true or false indicates whether you marked this chat as spam
messagesUnread	integer	discontinued
Example

[
  {
    "archived": "false",
    "pinned": "true",
    "messagesUnread": 0,
    "phone":"5511999999999", 
    "unread": "0",
    "name" : "Z-API SUPPORT" , 
    "lastMessageTime": "1622991687",
    "isMuted": "0",
    "isMarketSpam" : "false" 
  },
  {
    "archived":"false", 
    "pinned":"true", 
    "messagesUnread":0, 
    "phone":"5511999999999", 
    "unread":"0", 
    "name": "Z-api - Team",
    "lastMessageTime": "1622990503",
    "muteEndTime" : 1655953774000 , 
    "isMuted":"0", 
    "isMarketSpam" : "false" 
  }
]
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/chats?page=1&pageSize=2");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Get Chat Metadata
Method #
/chat/{phone}#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/chats/{phone}

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for returning the metadata information of a chat.

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number in DDI DDD NUMBER format. Ex: 551199999999. IMPORTANT: Send only numbers, without formatting or masking.
Options #
Attributes	Type	Description
Request Params#
Example URL #
Method

GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/chats/5511999999999

Response#
200#
Attributes	Type	Description
phone	string	Contact phone number
unread	string	indicates the number of unread messages in a chat
lastMessageTime	string	Timestamp with the date and time of the last interaction with the chat
isMuted	string	0 or 1 indicates whether or not you muted this chat
isMarketSpam	boolean	true or false indicates whether you marked this chat as spam
profileThumbnail	string	WhatsApp deletes chat photo URL after 48 hours
messagesUnread	integer	discontinued
about	string	Profile message
Example

{
  "phone":"5511999999999", 
  "unread":"0", 
  "lastMessageTime": "1619461666",
  "isMuted":"0", 
  "isMarketSpam" : "false" , 
  "profileThumbnail": "https://pps.whatsapp.net/v/t61.24694-24/170931400_212202650511993_3423338295209291992_n.jpg?ccb=11-4&oh=4b96b3bf7114122667f80d021b194f2c&oe=60C179E2",
  "messagesUnread":0, 
  "about" : "Profile message" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/chat/5511999999999");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Ler cats
Method #
/modify-chat#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/modify-chat

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for performing the action of reading a chat as a whole, or also marking a chat as unread.

Attributes #
Mandatory #
Attributes	Type	Description
phone	integer	Phone number you want to change in YOUR chat
action	string	Attribute to mark the chat (read or unread)
Request Body#
Example

{
  "phone":"5544999999999", 
  "action": "read" ou "unread"
}
Response#
200#
Attributes	Type	Description
value	boolean	Action confirmation attribute
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/modify-chat");

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5544991515165\", \"action\": \"read / unread*\"}");

CURLcode ret = curl_easy_perform(hnd);

Archive chats
Method #
/modify-chat#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/modify-chat

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for archiving and unarchiving your chats.

Attributes #
Mandatory #
Attributes	Type	Description
phone	integer	Phone number you want to change in YOUR chat
action	string	Attribute to archive and unarchive the chat
Request Body#
Example

{
  "phone":"5544999999999", 
  "action": "archive" ou "unarchive"
}
Response#
200#
Attributes	Type	Description
value	boolean	Action confirmation attribute
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/modify-chat");

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5544991515165\", \"action\": \"archive / unarchive / delete*\"}");

CURLcode ret = curl_easy_perform(hnd);

Pin chats
Method #
/modify-chat#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/modify-chat

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for pinning and unpinning your chats.

Attributes #
Mandatory #
Attributes	Type	Description
phone	integer	Phone number you want to change in YOUR chat
action	string	Attribute to pin and unpin the chat (pin or unpin)
Request Body#
Example

{
"phone":"5544999999999", 
"action": "pin" ou "unpin"
}
Response#
200#
Attributes	Type	Description
value	boolean	Action confirmation attribute
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/modify-chat");

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5544991515165\", \"action\": \"pin / unpin /\"}");

CURLcode ret = curl_easy_perform(hnd);

Rotate chats
Method #
/modify-chat#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/modify-chat

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for muting and unmuting your chats.

Attributes #
Mandatory #
Attributes	Type	Description
phone	integer	Phone number you want to change in YOUR chat
action	string	Attribute to mute and unmute the chat (mute or unmute)
Request Body#
Example

{
  "phone":"5544999999999", 
  "action" : "mute" or "unmute" 
}
Response#
200#
Attributes	Type	Description
value	boolean	Action confirmation attribute
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/modify-chat");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5544999999999\", \"action\": \"mute / unmute\"}");

CURLcode ret = curl_easy_perform(hnd);

Clear chat
Method #
/modify-chat#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/modify-chat

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for cleaning messages from your chats.

Attributes #
Mandatory #
Attributes	Type	Description
phone	integer	Phone number you want to change in YOUR chat
action	string	Attribute to clear the chat (clear)
Request Body#
Example

{
  "phone":"5544999999999", 
  "action": "clear"
}
Response#
200#
Attributes	Type	Description
value	boolean	Action confirmation attribute
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/modify-chat");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5544999999999\", \"action\": \"clear\"}");

CURLcode ret = curl_easy_perform(hnd);

Delete Chats
Method #
/modify-chat#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/modify-chat

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for deleting your chats.

Attributes #
Mandatory #
Attributes	Type	Description
phone	integer	Phone number you want to change in YOUR chat
action	string	Attribute to delete the chat
Request Body#
Example

{
  "phone":"5544999999999", 
  "action": "delete"
}
Response#
200#
Attributes	Type	Description
value	boolean	Action confirmation attribute
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/modify-chat");

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5544991515165\", \"action\": \"delete\"}");

CURLcode ret = curl_easy_perform(hnd);

Chat expiration
Method #
POST /send-chat-expiration#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-chat-expiration

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for sending chat expiration.

Attributes #
Mandatory #
Attributes	Type	Description
phone	integer	Phone number you want to enter YOUR chat expiration time
chatExpiration	string	Attribute to send chat expiration
Request Body#
Example

{
  "phone": "554497050785",
  "chatExpiration": "90_DAYS"
}
Opcões do chatExpiration: "24_HOURS", "7_DAYS", "90_DAYS", "OFF"

Response#
200#
Attributes	Type	Description
value	boolean	Action confirmation attribute
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

ntroduction
Conceptualization #
Now with Z-API you can make calls to any number. Currently, it's not possible to send audio during the call. We call this feature "attention grabbing." Remember the Facebook poke?

With this API you can tap and wait up to 15 seconds and hang up the call.

With incoming message webhooks, you can monitor notifications and see if the person answered or rejected the call.

About calls
Calls use the same communication channel as messages, so the queue is paused so that another message is not sent at the same time as you are calling someone.

Make a call
Method #
/send-call#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-call

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
In this method, you send a call to a number that has WhatsApp, whether it is your contact or not.

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Recipient's phone number in DDI DDD NUMBER format. Ex: 551199999999. IMPORTANT: Send only numbers, without formatting or masking.
Options #
Attributes	Type	Description
callDuration	number	Here you define how long you want the call to last, by default the call will last 5 seconds, but you can increase it up to 15 seconds
Request Body#
{
  "phone":"5511999999999", 
  "callDuration": 5
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-call");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"callDuration\": 5}");

CURLcode ret = curl_easy_perform(hnd);

Introduction
Conceptualization #
In this topic you will learn about all the methods available for manipulating groups.

As previously mentioned, everything in WhatsApp is a chat. Knowing this, a group is nothing more than a chat, and basically everything you send/receive in a chat can be sent/received with groups. The group has an ID/Phone number, which is nothing more than the phone number of the person who created it, concatenated with a timestamp something like "5511999999999-162327528," and it is this ID/Phone number that you will use as the phone number to send messages to your groups. To get this ID/Phone number, use the get/chats method.

In this topic you will also find methods for creating and managing groups.

Group ID/Phone
To better emphasize, think that the group id/phone is the number of whoever created it concatenated with a timestamp, something like this 5511999999999 - 1623275280

Attention
On November 4, 2021, WhatsApp changed the format for creating new groups, previously: "phone": "5511999999999-1623281429" now: "phone": "120363019502650977-group"

Search groups
Method #
/groups#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/groups

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for returning all groups.

Attributes #
Mandatory #
Attributes	Type	Description
page	integer	Used for pagination, you can enter the group page you want to search for here.
pageSize	integer	Specifies the size of the returned groups per page
Options #
Attributes	Type	Description
Request Params#
Example URL #
Method

GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/groups?page=1&pageSize=10

Response#
200#
Attributes	Type	Description
archived	boolean	true or false indicates whether the chat is archived
pinned	boolean	true or false indicates whether the chat is pinned
phone	string	Contact phone number
unread	string	indicates the number of unread messages in a chat
name	string	Name given to the chat, remembering that if it is a group or broadcast list you must return the respective IDs
lastMessageTime	string	Timestamp with the date and time of the last interaction with the chat
muteEndTime	string	Timestamp with the date and time the notification will be reactivated (-1 is forever)
isMuted	string	0 or 1 indicates whether or not you muted this chat
isMarketSpam	boolean	true or false indicates whether you marked this chat as spam
isGroup	boolean	true or false indicates whether it is a group or not
messagesUnread	integer	discontinued
Example

[
  {
    "isGroup": true,
    "name" : "Test group" , 
    "phone": "120263358412332916-group",
    "unread":"0", 
    "lastMessageTime": "1730918668000",
    "isMuted":"0", 
    "isMarketSpam" : "false" , 
    "archived":"false", 
    "pinned": "false",
    "muteEndTime" : null , 
    "messagesUnread": "0"
  }
]
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/groups?page=1&pageSize=2");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Creating groups
Method #
/create-group#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/create-group

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method creates a group with its respective participants. Unfortunately, it's not possible to create a group with an image, but you can use the Update-group-photo method in this same section right after creation.

Tip
Just like with WhatsApp Web, you'll need to add at least one contact to create a group.

warning
You must not pass the number connected to the Z-API that is responsible for creating the group in the array of numbers that will make up the group.

New attribute
WhatsApp recently implemented a validation to verify that the phone number connected to the API has a customer contact saved. However, Z-API developed a workaround to bypass this validation by introducing a new feature called "autoInvite ." Now, when a request is sent to add 10 customers to a group and only 5 of them are successfully added, the API sends private invitations to the five customers who were not added. These invitations allow them to join the group, even if their phone numbers are not saved as contacts.

Attributes #
Mandatory #
Attributes	Type	Description
autoInvite	boolean	true or false (Send group invite link privately)
groupName	string	Name of the group to be created
phones	array string	Array with the numbers to be added to the group
Options #
Attributes	Type	Description
Request Body#
Method

POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/create-group

Example

{
  "autoInvite": true,
  "groupName" : "Grupo Z-API" , 
  "phones": ["5544999999999", "5544888888888"]
}
Response#
200#
Attributes	Type	Description
phone	string	Group ID/Phone
invitationLink	string	link to join the group
Example


Ancient form -
  {
    "phone": "5511999999999-1623281429",
    "invitationLink": "https://chat.whatsapp.com/DCaqftVlS6dHWtlvfd3hUa"
  }

------------------------------------------------

New form
  {
    "phone":"120363019502650977-group", 
    "invitationLink": "https://chat.whatsapp.com/GONwbGGDkLe8BifUWwLgct"
  }

405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/create-group");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"groupName\": \"Meu grupo Z-API\", \"phones\": [\"5511999999999\",\"5511888888888\"], \"profileImage\": \"https://www.z-api.io/wp-content/themes/z-api/dist/images/logo.svg\"}");

CURLcode ret = curl_easy_perform(hnd);

Update group name
Method #
/update-group-name#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-group-name

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for changing the name of an existing group.

Attention
On November 4, 2021, WhatsApp changed the format for creating new groups, previously: "phone": "5511999999999-1623281429" now: "phone": "120363019502650977-group"

Attributes #
Mandatory #
Attributes	Type	Description
groupId	string	Group ID/Phone
groupName	string	Name of the group to be created
Options #
Attributes	Type	Description
Request Body#
URL#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-group-name

Body#

Ancient form -
  {
    "groupId": "5511999999999-1623281429",
    "groupName" : "My group name has changed in Z-API" 
  }

-----------------------------------------------

New form -
  {
    "groupId": "120363019502650977-group",
    "groupName" : "My group name has changed in Z-API" 
  }

Response#
200#
Attributes	Type	Description
value	boolean	true if it worked and false if it failed
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-group-name");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"groupName\": \"Novo nonme Z-API\", \"groupId\": \"5511999999999\"}");

CURLcode ret = curl_easy_perform(hnd);

Update group image
Method #
/update-group-photo#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-group-photo

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for changing the image of an existing group.

Attention
On November 4, 2021, WhatsApp changed the format for creating new groups, previously: "phone": "5511999999999-1623281429" now: "phone": "120363019502650977-group"

Attributes #
Mandatory #
Attributes	Type	Description
groupId	string	Group ID/Phone
groupPhoto	string	Image Url or Base64
Options #
Attributes	Type	Description
Request Body#
URL#
Method

POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-group-photo

Body#
{
  "groupId": "string",
  "groupPhoto": "https://www.z-api.io/wp-content/themes/z-api/dist/images/logo.svg"
}
Send Base64 image
If you have questions about how to send a Base64 image, access the "Send Image" messages topic, there you will find everything you need to know about sending in this format.

Response#
200#
Attributes	Type	Description
value	boolean	true if it worked and false if it failed
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-group-photo");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"groupID\": \"ID do Grupo\", \"groupPhoto\": \"Url ou Base64 da foto\"}");

CURLcode ret = curl_easy_perform(hnd);

Add Participants
Method #
/add-participant#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/add-participant

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for adding new participants to the group.

Attention
On November 4, 2021, WhatsApp changed the format for creating new groups, previously: "phone": "5511999999999-1623281429" now: "phone": "120363019502650977-group"

New attribute
WhatsApp recently implemented a validation to verify that the phone number connected to the API has a customer contact saved. However, Z-API developed a workaround to bypass this validation by introducing a new feature called "autoInvite ." Now, when a request is sent to add 10 customers to a group and only 5 of them are successfully added, the API sends private invitations to the five customers who were not added. These invitations allow them to join the group, even if their phone numbers are not saved as contacts.

Attributes #
Mandatory #
Attributes	Type	Description
autoInvite	boolean	Send group invitation link privately
groupId	string	Group ID/Phone
phones	array string	Array with the participant number(s) to be added
Options #
Attributes	Type	Description
Request Body#
URL#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/add-participant

Body#

Ancient form -
  {
    "autoInvite":true, 
    "groupId":"5511999999999-1623281429", 
    "phones":["5544999999999","5544888888888"]  
  }

  -------------------------------------------------

New form -
  {
  "autoInvite":true, 
  "groupId":"120363019502650977-group", 
  "phones":["5544999999999","5544888888888"]  
  }

Response#
200#
Attributes	Type	Description
value	boolean	true if it worked and false if it failed
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/add-participant");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"groupId\": \"5511999999999-1623281429\", \"phones\": [\"5511999999999\"]}");

CURLcode ret = curl_easy_perform(hnd);

Remove Participants
Method #
/remove-participant#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/remove-participant

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for removing participants from the group.

Attention
On November 4, 2021, WhatsApp changed the format for creating new groups, previously: "phone": "5511999999999-1623281429" now: "phone": "120363019502650977-group"

Attributes #
Mandatory #
Attributes	Type	Description
groupId	string	Group ID/Phone
phones	array string	Array with the participant number(s) to be removed
Options #
Attributes	Type	Description
Request Body#
URL#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/remove-participant

Body#

Ancient form -
  {
    "groupId":"5511999999999-1623281429", 
    "phones":["5544999999999","5544888888888"]  
  }

  -------------------------------------------------

New form -
  {
    "groupId":"120363019502650977-group", 
    "phones":["5544999999999","5544888888888"]  
  }

Response#
200#
Attributes	Type	Description
value	boolean	true if it worked and false if it failed
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/remove-participant");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"groupId\": \"5511999999999-1623281429\", \"phones\": [\"5511999999999\"]}");

CURLcode ret = curl_easy_perform(hnd);

Approve Participants
Method #
/approve-participant#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/approve-participant

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for accepting participants into the group.

Attention
On November 4, 2021, WhatsApp changed the format for creating new groups, previously: "phone": "5511999999999-1623281429" now: "phone": "120363019502650977-group"

Attributes #
Mandatory #
Attributes	Type	Description
groupId	string	Group ID/Phone
phones	array string	Array with the participant number(s) to be accepted
Options #
Attributes	Type	Description
Request Body#
URL#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/approve-participant

Body#

Ancient form -
  {
    "groupId":"5511999999999-1623281429", 
    "phones":["5544999999999","5544888888888"]  
  }

  -------------------------------------------------

New form -
  {
    "groupId":"120363019502650977-group", 
    "phones":["5544999999999","5544888888888"]  
  }

Response#
200#
Attributes	Type	Description
value	boolean	true if it worked and false if it failed
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/approve-participant");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"groupId\": \"5511999999999-1623281429\", \"phones\": [\"5511999999999\"]}");

CURLcode ret = curl_easy_perform(hnd);

Reject Participants
Method #
/reject-participant#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/reject-participant

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for rejecting participants from joining the group.

Attention
On November 4, 2021, WhatsApp changed the format for creating new groups, previously: "phone": "5511999999999-1623281429" now: "phone": "120363019502650977-group"

Attributes #
Mandatory #
Attributes	Type	Description
groupId	string	Group ID/Phone
phones	array string	Array with the participant number(s) to be rejected
Options #
Attributes	Type	Description
Request Body#
URL#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/reject-participant

Body#

Ancient form -
  {
    "groupId":"5511999999999-1623281429", 
    "phones":["5544999999999","5544888888888"]  
  }

  -------------------------------------------------

New form -
  {
    "groupId":"120363019502650977-group", 
    "phones":["5544999999999","5544888888888"]  
  }

Response#
200#
Attributes	Type	Description
value	boolean	true if it worked and false if it failed
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/reject-participant");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"groupId\": \"5511999999999-1623281429\", \"phones\": [\"5511999999999\"]}");

CURLcode ret = curl_easy_perform(hnd);

Mention member
Method #
/send-text#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-text

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for mentioning the participants in a group.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Group ID where participants will be mentioned
message	string	Text to be sent. Must contain @ with the number
mentioned	array	numbers to be mentioned
Options #
Attributes	Type	Description
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
Request Body#
{
  "phone": "5511999999999-group",
  "message": "Welcome to *Z-API group* @número",
  "mentioned" : [ number ] 
}
Mark all in group #
This method allows you to mention multiple members of a WhatsApp group without having to explicitly include the "@" before the numbers. This is useful for tagging multiple members at once.

{
  "phone":"5511999999999-group", 
  "message": "Welcome to *Z-API group*",
  "mentioned" : [ number , number , number , number , number , number ] 
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-text");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"message\": \"Welcome to *Z-API*\"}");

CURLcode ret = curl_easy_perform(hnd);

Mention group
Method #
/send-text#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-text

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for mentioning groups related to a community. Mentions can only be made to groups within a community, and the mentioned groups must belong to the same community.

image

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Group ID where groups will be mentioned
message	string	Text to be sent. Must contain @ with the group ID
groupMentioned	GroupMentioned[]	List of objects with the data of the group to be mentioned
GroupMentioned#
Attributes	Type	Description
phone	string	ID of the group that will be mentioned
subject	string	Group name
Options #
Attributes	Type	Description
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex. "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
Request Body#
{
  "phone":"5511999999999-group", 
  "message": "Welcome to *Z-API group* @1203634230225498-group",
  "groupMentioned": [
    {
      "phone": "1203634230225498-group",
      "subject": "Z-API subgroup"
    }
  ]
}
tip
It is also possible to mention participants in the message along with mentioning the groups.

Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-text");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"message\": \"Welcome to *Z-API*\"}");

CURLcode ret = curl_easy_perform(hnd);

Promote group admin
Method #
/add-admin#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/add-admin

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for promoting group participants to administrators, you can promote one or more participants to administrator.

Attention
On November 4, 2021, WhatsApp changed the format for creating new groups, previously: "phone": "5511999999999-1623281429" now: "phone": "120363019502650977-group"

Attributes #
Mandatory #
Attributes	Type	Description
groupId	string	Group ID/Phone
phones	array string	Array with the number(s) of the participant(s) to be promoted
Options #
Attributes	Type	Description
Request Body#
URL#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/add-admin

Body#

Ancient form -
  {
    "groupId":"5511999999999-1623281429", 
    "phones":["5544999999999","5544888888888"]  
  }

  -------------------------------------------------

New form -
  {
    "groupId":"120363019502650977-group", 
    "phones":["5544999999999","5544888888888"]  
  }

Response#
200#
Attributes	Type	Description
value	boolean	true if it worked and false if it failed
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/add-admin");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"groupId\": \"5511999999999-1623281429\", \"phones\": [\"5511999999999\"]}");

CURLcode ret = curl_easy_perform(hnd);

Remove group admin
Method #
/remove-admin#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/remove-admin

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for removing one or more administrators from a group.

Attention
On November 4, 2021, WhatsApp changed the format for creating new groups, previously: "phone": "5511999999999-1623281429" now: "phone": "120363019502650977-group"

Attributes #
Mandatory #
Attributes	Type	Description
groupId	string	group id/phone
phones	array string	Array with the number(s) to be removed from the group administration
Options #
Attributes	Type	Description
Request Body#
URL#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/remove-admin

Body#

Ancient form -
  {
    "groupId":"5511999999999-1623281429", 
    "phones":["5544999999999","5544888888888"]  
  }

  -------------------------------------------------

New form -
  {
    "groupId":"120363019502650977-group", 
    "phones":["5544999999999","5544888888888"]  
  }


---

## Response

### 200

| Attributes | Type | Description |
| :-------- | :------ | :-------------------------------------------------- |
| value | boolean | true if successful and false if failed |

**Example**

```json
{
  "value": true
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/remove-admin");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"groupId\": \"5511999999999-1623281429\", \"phones\": [\"5511999999999\"]}");

CURLcode ret = curl_easy_perform(hnd);

Leave the group
Method #
/leave-group#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/leave-group

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method allows you to leave a group you are a member of.

Attention
On November 4, 2021, WhatsApp changed the format for creating new groups, previously: "phone": "5511999999999-1623281429" now: "phone": "120363019502650977-group"

Attributes #
Mandatory #
Attributes	Type	Description
groupId	string	Group ID/Phone
Options #
Attributes	Type	Description
Request Body#
URL#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/leave-group

Body#

Ancient form -
  {
    "groupId": "5511999999999-1623281429"
  }

-----------------------------------------

New form -
  {
    "groupId": "120363019502650977-group"
  }

Response#
200#
Attributes	Type	Description
value	boolean	true if it worked and false if it failed
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/leave-group");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"groupId\": \"5511999999999-1623281429\"}");

CURLcode ret = curl_easy_perform(hnd);

Group Metadata
Method #
/group-metadata#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/group-metadata/{phone}

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method returns the group metadata with all information about the group and its participants.

Attention
On November 4, 2021, WhatsApp changed the format for creating new groups, previously: "phone": "5511999999999-1623281429" now: "phone": "120363019502650977-group"

Attributes #
Mandatory #
Attributes	Type	Description
groupId	string	Group ID/Phone
Options #
Attributes	Type	Description
Request Params#
URL#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/group-metadata/{phone}

Response#
200#
Attributes	Type	Description
phone	string	Group ID/Phone
description	string	Group Description
owner	string	Group creator number
subject	string	Group name
creation	timestamp	Timestamp of the group creation date
invitationLink	url	Group invite link (returns to admin only)
communityId	string	Community ID
adminOnlyMessage	boolean	Indicates whether only Admin can send messages
adminOnlySettings	boolean	Indicates whether only Admin can change the settings
requireAdminApproval	boolean	Indicates whether admin approval is required to join the group
isGroupAnnouncement	boolean	Indicates whether it is a warning group
participants	array string	with participant data
Array String (participants)

Attributes	Type	Description
phone	string	Participant's phone
isAdmin	string	Indicates whether the participant is a group administrator
isSuperAdmin	string	Indicates whether you are the creator of the group
Example


Ancient form -
  {
    "phone":"5511999999999-1623281429", 
    "owner": "5511999999999",
    "subject" : "My group in Z-API" , 
    "creation": 1588721491000,
    "participants": [
      {
        "phone": "5511888888888",
        "isAdmin" : false , 
        "isSuperAdmin" : false 
      },
      {
        "phone": "5511777777777",
        "isAdmin": true,
        "isSuperAdmin" : false , 
        "short" : "ZAPIs" , 
        "name": "ZAPIs Boys"
      }
    ],
    "subjectTime": 1617805323000,
    "subjectOwner": "554497050785"
  }

  ------------------------------------

  New form -
  {
  "phone":"120363019502650977-group", 
  "description" : "Z-API Group" , 
  "owner":"5511999999999", 
  "subject" : "My group in Z-API" , 
  "creation":1588721491000, 
  "invitationLink": "https://chat.whatsapp.com/40Aasd6af1",
  "communityId": null,
  "adminOnlyMessage": false,
  "adminOnlySettings": false,
  "requireAdminApproval": false,
  "isGroupAnnouncement": false,
  "participants":[ 
    {
      "phone":"5511888888888", 
      "isAdmin" : false , 
      "isSuperAdmin" : false 
    },
    {
      "phone":"5511777777777", 
      "isAdmin":true, 
      "isSuperAdmin" : false , 
      "short" : "ZAPIs" , 
      "name":"ZAPIs Boys" 
    }
  ],
  "subjectTime":1617805323000, 
  "subjectOwner":"554497050785" 
}

405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/group-metadata/5511999999999-1623281429");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "accept: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Group Metadata (lightweight)
Method #
/light-group-metadata#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/light-group-metadata/{phone}

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method returns the group metadata with all information about the group and its participants except the group invitation link.

The only difference between this method and Group Metadata is that it doesn't return the group invite link, as obtaining this link can be costly and time-consuming at times. With this in mind, we've provided a lightweight way to retrieve group metadata.

If you want to use this method and later need the group invite link, you can get it from the Get Group Invite Link API .

Attention
On November 4, 2021, WhatsApp changed the format for creating new groups, previously: "phone": "5511999999999-1623281429" now: "phone": "120363019502650977-group"

Attributes #
Mandatory #
Attributes	Type	Description
groupId	string	Group ID/Phone
Options #
Attributes	Type	Description
Request Params#
URL#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/light-group-metadata/{phone}

Response#
200#
Attributes	Type	Description
phone	string	Group ID/Phone
description	string	Group Description
owner	string	Group creator number
subject	string	Group name
creation	timestamp	Timestamp of the group creation date
communityId	string	Community ID
adminOnlyMessage	boolean	Indicates whether only Admin can send messages
adminOnlySettings	boolean	Indicates whether only Admin can change the settings
requireAdminApproval	boolean	Indicates whether admin approval is required to join the group
isGroupAnnouncement	boolean	Indicates whether it is a warning group
participants	array string	with participant data
Array String (participants)

Attributes	Type	Description
phone	string	Participant's phone
isAdmin	string	Indicates whether the participant is a group administrator
isSuperAdmin	string	Indicates whether you are the creator of the group
Example

  {
  "phone":"120363019502650977-group", 
  "description" : "Z-API Group" , 
  "owner":"5511999999999", 
  "subject" : "My group in Z-API" , 
  "creation":1588721491000, 
  "invitationLink": null,
  "communityId":null, 
  "adminOnlyMessage":false, 
  "adminOnlySettings":false, 
  "requireAdminApproval":false, 
  "isGroupAnnouncement":false, 
  "participants":[ 
    {
      "phone":"5511888888888", 
      "isAdmin" : false , 
      "isSuperAdmin" : false 
    },
    {
      "phone":"5511777777777", 
      "isAdmin":true, 
      "isSuperAdmin" : false , 
      "short" : "ZAPIs" , 
      "name":"ZAPIs Boys" 
    }
  ],
  "subjectTime":1617805323000, 
  "subjectOwner":"554497050785" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/light-group-metadata/123123123-group");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "accept: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Invite Group Metadata
Method #
/group-invitation-metadata#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/group-invitation-metadata?url=url-do-grupo

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method returns the group metadata with all information about the group and its participants.

Attention
On November 4, 2021, WhatsApp changed the format for creating new groups, previously: "phone": "5511999999999-1623281429" now: "phone": "120363019502650977-group"

Response#
200#
Attributes	Type	Description
phone	string	Group ID/Phone
owner	string	Group creator number
subject	string	Group name
description	string	Group Description
creation	timestamp	Timestamp of the group creation date
invitationLink	url	Group invite link
contactsCount	number	Number of contacts present in the group
participantsCount	number	Number of participants in the group
participants	array string	with participant data
Array String (participants)

Attributes	Type	Description
phone	string	Participant number
isAdmin	string	Indicates whether the participant is a group administrator
isSuperAdmin	string	Indicates whether you are the creator of the group
subjectTime	timestamp	Group creation date
subjectOwner	string	Group creator number
Example


  {
    "phone":"120363019502650977-group", 
    "owner": "5511888888888",
    "subject" : "My group in Z-API" , 
    "description" : "group description" , 
    "creation":1588721491000, 
    "invitationLink": "https://chat.whatsapp.com/KNmcL17DqVA0sqkQ5LLA5",
    "contactsCount": 1,
    "participantsCount": 1,
    "participants":[ 
      {
        "phone":"5511888888888", 
        "isAdmin" : false , 
        "isSuperAdmin" : true 
      },
      {
        "phone":"5511777777777", 
        "isAdmin" : false , 
        "isSuperAdmin" : false 
      }
    ],
    "subjectTime":1617805323000, 
    "subjectOwner": "5511888888888"
}

405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/group-invitation-metadata?URL=(URL-DO-GRUPO)");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "accept: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Group settings
Method #
/update-group-settings#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-group-settings

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method allows you to change group preferences.

Attention
Please note that only administrators can change group preferences.

Attention
On November 4, 2021, WhatsApp changed the format for creating new groups, previously: "phone": "5511999999999-1623281429" now: "phone": "120363019502650977-group"

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	Group ID/Phone
adminOnlyMessage	boolean	Only administrators can send messages in the group
adminOnlySettings	boolean	Attribute to allow only admins to make edits to the group
requireAdminApproval	boolean	Defines whether approval from an admin will be required to join the group
adminOnlyAddMember	boolean	Only administrators can add people to the group
Request Body#

Ancient form -
  {
    "phone":"5511999999999-1623281429", 
    "adminOnlyMessage": true,
    "adminOnlySettings": true,
    "requireAdminApproval":false, 
    "adminOnlyAddMember": true
  }

----------------------------------------

New form -
  {
    "phone":"120363019502650977-group", 
    "adminOnlyMessage":true, 
    "adminOnlySettings":true, 
    "requireAdminApproval":false, 
    "adminOnlyAddMember":true 
  }

Response#
200#
Attributes	Type	Description
value	boolean	true if it worked and false if it failed
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-group-settings");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"groupId\": \"5511999999999-1623281429\",\"adminOnlyMessage\": true}");

CURLcode ret = curl_easy_perform(hnd);

Change description
Method #
/update-group-description#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-group-description

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method allows you to change the group description.

Attention
Please note that only administrators can change group preferences.

Attention
On November 4, 2021, WhatsApp changed the format for creating new groups, previously: "phone": "5511999999999-1623281429" now: "phone": "120363019502650977-group"

Attributes #
Mandatory #
Attributes	Type	Description
groupId	string	Group ID/Phone
groupDescription	string	Attribute to change group description
Body#

Ancient form -
  {
    "groupId":"5511999999999-1623281429", 
    "groupDescription" : "group description" 
  }

----------------------------------------

New form -
  {
    "groupId":"120363019502650977-group", 
    "groupDescription" : "group description" 
  }

Response#
200#
Attributes	Type	Description
value	boolean	true if it worked and false if it failed
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-group-description");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"groupId\": \"5511999999999-1623281429\",\"groupDescription\": \"descrição do grupo\"}");

CURLcode ret = curl_easy_perform(hnd);

Reset group invite link
Method #
/redefine-invitation-link/{groupId}#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/redefine-invitation-link/{groupId}

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method allows you to reset a group's invite link.

Attention
On November 4, 2021, WhatsApp changed the format for creating new groups, previously: "phone": "5511999999999-1623281429" now: "phone": "120363019502650977-group"

Attributes #
Mandatory #
Attributes	Type	Description
groupId	string	Group ID/Phone
Request url#
URL#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/redefine-invitation-link/120363019502650977-group

Response#
200#
Attributes	Type	Description
invitationLink	string	New invitation link
Example

{
  "invitationLink":"https://chat.whatsapp.com/C1adgkdEGki7554BWDdMkd" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/redefine-invitation-link/120363019502650977-group");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Get group invite link
Method #
/group-invitation-link/{groupId}#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/group-invitation-link/{groupId}

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method allows you to get a group's invite link.

Attention
On November 4, 2021, WhatsApp changed the format for creating new groups, previously: "phone": "5511999999999-1623281429" now: "phone": "120363019502650977-group"

Attributes #
Mandatory #
Attributes	Type	Description
groupId	string	Group ID/Phone
Request url#
URL#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/group-invitation-link/120363019502650977-group

Response#
200#
Attributes	Type	Description
invitationLink	string	New invitation link
Example

{
  "phone":"120363019502650977-group", 
  "invitationLink":"https://chat.whatsapp.com/C1adgkdEGki7554BWDdMkd" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/group-invitation-link/120363019502650977-group");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Accept group invitation
Method #
/accept-invite-group?url={{URL_DE_CONVITE}} #
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/accept-invite-group?url={{URL_DE_CONVITE}}

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for accepting an invitation you received to join a group.

Attributes #
Mandatory #
Attributes	Type	Description
url	string	URL received from group invitation. Can be obtained from this webhook
URL#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/accept-invite-group?url=https://chat.whatsapp.com/bh8XyNrIUj84YZoy5xcaa112

Response#
200#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
Example

{
  "success":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receiving) invitation message

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/accept-invite-group?url=%7B%7BGROUP_INVITE_URL%7D%7D");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Introduction
Conceptualization #
WhatsApp now offers Communities, a feature that allows users to create groups around a common topic or interest. It's an easy way to connect with others who share the same goals and ideas.

To illustrate how the community structure works, see the image below:


Observations:

When you create a community, a default group (announcement group) is created with the same name as the community.
This group represents your entire community and is used to send messages to everyone.
Each new group linked to the community, all participants will be part of the default group (notice group).
When you unlink a group, all members of that group are removed from the default group (alert group).
As you can see above, every community has a "Notice Group" in which only administrators can send messages, use it whenever you want to send something to the entire community.

Each community can have up to 50 groups, and community administrator(s) can send messages to up to 5,000 people at once through the notification group.

Questions about how APIs work #
1. How do I create a new community? #
First, it is important to check if your cell phone's WhatsApp application is already compatible with communities. If not, wait for the application to update for your account. Now, if you already have access to communities, see the documentation on how to create a community via API.

2. Can I list the communities I belong to? #
Yes, the Z-API provides methods to help you find out which communities you are part of. See the documentation on how to list your communities.

3. Can I link and unlink groups to a community? #
Absolutely! Z-API provides you with two other APIs so you can manage groups within a community. See how to link or unlink groups from a community.

4. How to send a message to the entire community? #
As mentioned above, the community itself serves only to group your groups and provide users with an experience and overview of all community groups. You can send messages to the entire community , but the Announcements Group is used for this purpose . Since the Announcements Group is a group like any other, you simply need the group's phone number and use the messaging APIs normally, just like other regular groups.

5. How can I get the group notices? #
There are three ways to retrieve announcement groups.
The first is when creating a community , which returns the announcement group information upon creation.
The second is through the Chat List API , which allows you to differentiate between regular groups and announcement groups. The isGroup attribute will be set to true for regular groups, and the isGroupAnnouncement attribute will be set to true for announcement groups.
The third and final option is through the Community Metadata API , which returns information about the community based on its ID, including the community name and its associated groups.

6. Can I deactivate a community? #
Yes, you can deactivate a Community on WhatsApp, which will result in the disconnection of all related groups. It's important to note that deactivating a Community won't delete its groups, but rather remove them from the Community in question.

7. How do I add or remove people from the community? #
As mentioned previously, the community itself is just what groups your groups together, what is actually used are the announcement groups, so if you want to generate the invitation link, add and remove people, promote as administrators, etc... everything will be done through the announcement group using the APIs you already know.


Method #
/create-group#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/communities

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Before using this feature, it is important to check if the WhatsApp application on your cell phone already has compatibility with communities. If it is already available, you can use this API to create new communities.

Attributes #
Mandatory #
Attributes	Type	Description
name	string	Name of the community you want to create
Options #
Attributes	Type	Description
description	string	Community Description
Request Body#
Method

POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/communities

Example

{
  "name" : "My first Community" 
}
Response#
200#
Attributes	Type	Description
id	string	Community ID created
subGroups	array[subgroup]	List of linked groups
Example

{
  "id": "98372465382764532938",
  "subGroups": [
    {
      "name" : "My first Community" , 
      "phone":"342532456234453-group", 
      "isGroupAnnouncement": true
    }
  ]
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/communities");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"name\": \"Minha primeira Comunidade\"}");

CURLcode ret = curl_easy_perform(hnd);

List communities
Method #
/communities#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/communities

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for returning all the communities you are part of.

Attributes #
Mandatory #
Attributes	Type	Description
Options #
Attributes	Type	Description
page	integer	Used for pagination, you can enter here the page of communities you want to search for.
pageSize	integer	Specifies the size of communities returned per page
Request Params#
Example URL #
Method

GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/communities

Response#
200#
Attributes	Type	Description
name	string	Community name
id	string	Community identifier
Example

[
  {
    "name" : "My first Community" , 
    "id": "98372465382764532938"
  }
]
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/communities?page=1&pageSize=2");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Link groups
Method #
/communities/link#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/communities/link

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
With this API you can add other groups to a community, for this you will need your community ID and the phone numbers of the groups you want to add.

Attention
It is important to remember that it is not possible to link the same group to more than one community. If you enter 3 groups to add where 1 is already in a community, 2 will be added and the other will return in the response that it is already part of another community.

Attributes #
Mandatory #
Attributes	Type	Description
communityId	string	Community ID that will be added to groups
groupsPhones	array string	Array with the number(s) of groups to be linked
Options #
Attributes	Type	Description
Request Body#
URL#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/communities/link

Body#
{
  "communityId": "98372465382764532938",
  "groupsPhones": ["1345353454354354-group", "1203634230225498-group"]
}
Response#
200#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
Example

{
  "success":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/communities/link");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"communityId\": \"98372465382764532938\", \"groupsPhones\": [\"1345353454354354-group\", \"1203634230225498-group\"]}");

CURLcode ret = curl_easy_perform(hnd);

Unlink groups
Method #
/communities/unlink#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/communities/unlink

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
With this API you can remove groups from a community, for this you will need your community ID and the phone numbers of the groups you want to remove.

Attention
A community must have at least 1 group linked to it, not counting the notice group, so if your community only has one common group linked, it will not be possible to remove it.

Attributes #
Mandatory #
Attributes	Type	Description
communityId	string	Community ID that will be unlinked from groups
groupsPhones	array string	Array with the number(s) of groups to be unlinked
Options #
Attributes	Type	Description
Request Body#
URL#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/communities/unlink

Body#
{
  "communityId":"98372465382764532938", 
  "groupsPhones": ["1345353454354354-group"]
}
Response#
200#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
Example

{
  "success":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/communities/unlink");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"communityId\": \"98372465382764532938\", \"groupsPhones\": [\"1345353454354354-group\"]}");

CURLcode ret = curl_easy_perform(hnd);

Community metadata
Method #
/communities-metadata/{communityId}#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/communities-metadata/{idDaComunidade}

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method returns the community metadata, such as name, description, and groups that are linked to it.

Attributes #
Mandatory #
Attributes	Type	Description
Options #
Attributes	Type	Description
Request Params#
URL#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/communities-metadata/{idDaComunidade}

Response#
200#
Attributes	Type	Description
name	string	Community name
id	string	Community ID
description	string	Community Description
subGroups	array subgroup	list of linked groups
Array (subGroups)

Attributes	Type	Description
name	string	Subgroup name
phone	string	Subgroup phone number
isGroupAnnouncement	boolean	Please indicate whether it is a group of warnings or common
Example

{
  "name" : "My first Community" , 
  "id":"98372465382764532938", 
  "description" : "A description of the community" , 
  "subGroups":[ 
    {
      "phone" : "My first Community" , 
      "phone":"342532456234453-group", 
      "isGroupAnnouncement":true 
    },
    {
      "phone" : "Other group" , 
      "phone":"1203634230225498-group", 
      "isGroupAnnouncement": false
    }
  ]
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/communities-metadata/%7BidDaComunidade%7D");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Reset Community Invite Link
Method #
/redefine-invitation-link/{communityId}#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/redefine-invitation-link/{communityId}

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method allows you to reset a community's invite link.

Attributes #
Mandatory #
Attributes	Type	Description
communityId	string	Community ID/Phone
Request url#
URL#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/redefine-invitation-link/120363019502650977

Response#
200#
Attributes	Type	Description
invitationLink	string	New invitation link
Example

{
  "invitationLink":"https://chat.whatsapp.com/C1adgkdEGki7554BWDdMkd" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/redefine-invitation-link/120363019502650977");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Add participants
Method #
/add-participant#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/add-participant

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for adding new participants to the community.

New attribute
WhatsApp recently implemented a validation to verify that the phone number connected to the API has a customer contact saved. However, Z-API developed a workaround to bypass this validation by introducing a new feature called "autoInvite ." Now, when a request is sent to add 10 customers to a group and only 5 of them are successfully added, the API sends private invitations to the five customers who were not added. These invitations allow them to join the community, even if their phone numbers are not saved as contacts.

Attributes #
Mandatory #
Attributes	Type	Description
autoInvite	boolean	Send community invitation link privately
communityId	string	Community ID/Phone. Can be obtained from the List Communities API.
phones	array string	Array with the participant number(s) to be added
Request Body#
URL#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/add-participant

Body#
  {
  "autoInvite":true, 
  "communityId": "120363019502650977",
  "phones":["5544999999999","5544888888888"]  
  }
Response#
200#
Attributes	Type	Description
value	boolean	true if it worked and false if it failed
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/add-participant");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"communityId\": \"120363186053925765\", \"phones\": [\"5511999999999\"], \"autoInvite\": true}");

CURLcode ret = curl_easy_perform(hnd);

Remove participants
Method #
/remove-participant#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/remove-participant

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for removing participants from the community.

Attributes #
Mandatory #
Attributes	Type	Description
communityId	string	Community ID/Phone. Can be obtained from the List Communities API.
phones	array string	Array with the participant number(s) to be removed
Request Body#
URL#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/remove-participant

Body#
  {
    "communityId": "5511999999999",
    "phones":["5544999999999","5544888888888"]  
  }
Response#
200#
Attributes	Type	Description
value	boolean	true if it worked and false if it failed
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/remove-participant");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"communityId\": \"120363186053925765\", \"phones\": [\"5511999999999\"]}");

CURLcode ret = curl_easy_perform(hnd);

Promote community admin
Method #
/add-admin#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/add-admin

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for promoting community participants to administrators, you can promote one or more participants to administrator.

Attributes #
Mandatory #
Attributes	Type	Description
communityId	string	Community ID/Phone. Can be obtained from the List Communities API.
phones	array string	Array with the number(s) of the participant(s) to be promoted
Request Body#
URL#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/add-admin

Body#
  {
    "communityId": "120363186053925765",
    "phones":["5544999999999","5544888888888"]  
  }
Response#
200#
Attributes	Type	Description
value	boolean	true if it worked and false if it failed
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/add-admin");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"communityId\": \"120363186053925765\", \"phones\": [\"5511999999999\"]}");

CURLcode ret = curl_easy_perform(hnd);

Remove community admin
Method #
/remove-admin#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/remove-admin

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for removing one or more administrators from a community.

Attributes #
Mandatory #
Attributes	Type	Description
communityId	string	Community ID/phone. Can be obtained from the List Communities API
phones	array string	Array with the number(s) to be removed from the group administration
Request Body#
URL#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/remove-admin

Body#
  {
    "communityId":"120363019502650977", 
    "phones":["5544999999999","5544888888888"]  
  }
Response#
200#
Attributes	Type	Description
value	boolean	true if it worked and false if it failed
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/remove-admin");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"communityId\": \"120363186053925765\", \"phones\": [\"5511999999999\"]}");

CURLcode ret = curl_easy_perform(hnd);

Community Settings
Method #
/communities/settings#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/communities/settings

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
With this API you can change the settings of a community.

Attributes #
Mandatory #
Attributes	Type	Description
communityId	string	Community ID that will be changed in settings
whoCanAddNewGroups	string (admins ou all)	Configure who can add new groups to this community. Admins only or everyone.
Request Body#
URL#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/communities/settings

Body#
{
  "communityId":"98372465382764532938", 
  "whoCanAddNewGroups": "admins" | "all"
}
Response#
200#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
Example

{
  "success":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/communities/settings");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"communityId\": \"98372465382764532938\", \"whoCanAddNewGroups\": \"admins\"}");

CURLcode ret = curl_easy_perform(hnd);

Deactivate community
Method #
/queue#
DELETE https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/communities/{idDaComunidade}

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method is responsible for deactivating a community.

Deactivating a Community will result in the disconnection of all related groups. It's important to note that deactivating a Community will not delete its groups, but rather remove them from the Community in question.

Attributes #
Mandatory #
Attributes	Type	Description
Options #
Attributes	Type	Description
Request Params#
Example URL #
Method

DELETE https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/communities/{idDaComunidade}

Response#
200#
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "DELETE");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/communities/%7BidDaComunidade%7D");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "accept: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Change description
Method #
/update-community-description#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-community-description

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method allows you to change the community description.

Attention
Please note that only administrators can change community preferences.

Attributes #
Mandatory #
Attributes	Type	Description
communityId	string	Group ID/Phone
communityDescription	string	Attribute to change community description
Body#

  {
    "communityId":"120363019502650977", 
    "communityDescription" : "community description" 
  }

Response#
200#
Attributes	Type	Description
value	boolean	true if it worked and false if it failed
Example

{
  "value":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-community-description");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"communityId\": \"120363019502650977\",\"communityDescription\": \"descrição da comunidade\"}");

CURLcode ret = curl_easy_perform(hnd);

Introduction
Integration with Meta AI in Z-API #
Meta AI offers a range of advanced features that transform WhatsApp into a true digital assistant, aiming to make users' daily lives more practical and interactive. With Meta AI, users can search directly in the app, without having to open a browser, and receive personalized suggestions for actions and events, such as restaurant recommendations, travel destinations, and even activity planning based on specified preferences and needs.

One of the features is the "Imagine" functionality, which allows users to create images from text descriptions provided by the user, integrating a unique visual element into interactions. This approach expands service and creativity possibilities, offering support and solutions with quick and engaging responses.

Z-API now enables businesses and developers to automate conversations, respond intelligently, and significantly improve their customer experience. This connectivity enables more dynamic, intuitive, and effective user interactions, adding value to both support and overall customer engagement.

warning
This feature is only available for personal WhatsApp accounts, i.e., it is not accessible for business accounts.

Chat with Meta AI
Method #
/send-text

POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-text

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
This method allows direct interaction with Meta AI on WhatsApp through the Z-API, making it easy to send text messages to get automated, contextual responses. With it, you can send questions and commands to Meta AI in private conversations, directing messages to the dedicated number 13135550002, or include the AI ​​in groups using the group ID as the recipient.

How to Use #
To start using Meta AI with Z-API simply send a text message to the Meta AI number 13135550002using the endpoint/send-text

Attention
Currently, Meta AI in Z-API only supports text messages. This means that audio, documents, images, and other multimedia files are not supported in this integration. Therefore, only text messages must be sent to ensure proper functionality.

Additionally, this feature is only available for personal WhatsApp accounts, i.e., it is not accessible for business accounts.

Attributes #
Mandatory #
Attributes	Type	Description
phone	string	For private chat with the AI, use 13135550002 ; for group, use the group ID.
message	string	Text to be sent
Options #
Attributes	Type	Description
delayMessage	number	In this attribute, a delay is added to the message. You can choose between a range of 1 to 15 seconds, which means how many seconds it will wait to send the next message. (Ex.: "delayMessage": 5, ). The default delay, if not specified, is 1 to 3 seconds.
delayTyping	number	In this attribute, a delay is added to the message. You can choose between a range of 1~15 sec, which means how many seconds the message will remain in the "Typing..." status. (Ex. "delayTyping": 5, ). The default delay, if not specified, is 0.
mentioned	array	You must pass the number 13135550002 if you want to activate Meta AI in a group.
Request Body#
Chat in private chat #
{
  "phone": "13135550002",
  "message" : "Hello, Meta AI! I would like to know about..." 
}
Chat in groups #
{
  "phone":"5511999999999-group", 
  "message" : "@13135550002 Hello, Meta AI! I would like to know about..." , 
  "mentioned": [13135550002]
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-text");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\": \"5511999998888\", \"message\": \"Welcome to *Z-API*\"}");

CURLcode ret = curl_easy_perform(hnd);

Introdução
Fila#
O Z-API disponibiliza a seus usuários um sistema de fila que funciona unicamente para as mensagens envidas através da nossa API. Esta fila exerce um importante papel em nossa arquitetura que é o de organizar e ordenar as mensagens até que as mesmas sejam entregues ao WhatsApp. Este recurso também é muito útil para aquelas situaçoes onde o celular conectado ao Z-API passa por algumas instabilidade ou fique fora da internet. Caso isso ocorra, ou seja, se o celular fica por um periodo fora ar, assim que você voltar a conectar as mensagens serão enviadas ao destinatário normalmente.

Tempo de envio
Nossa fila trabalha com tempo de envio alternado entre uma mensagem e outra afim de simular o comportamento humano este intervalo fica em um range default randômico entre 1~3 segundos por mensagem.

Caso queria aumentar o delay das mensagens, você pode passar o atributo delayMessage no body da requisição. Para saber como veja em Send-message

Recomendação#
Recomendamos que sempre antes se conectar você verifique se existem mensagens pendêntes de envio na fila, caso tenha avise seu usuário e solicite a ele a decisão de enviar ou não enviar mais estas mensagens que estão na fila. Imagine que talvez as mensagens na fila possam já não fazer mais sentido para serem enviadas, então é importente notificar o usuário e dar esta decisão a ele.

Sempre que você se conectar ao Z-API ele vai automaticamente executar a fila disparar as mensagens da fila caso tenha. Então muito cuidado!

Você pode apagar uma fila via API ou ainda pelo painel admin do Z-API.

Limite da Fila
O Z-API permite até 1000 mensagens para celulares descontectados em sua fila antes de começar a rejeitar novas mensagens para fila.

Fila
Método#
/queue#
GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/queue

Header#
Key	Value
Client-Token	TOKEN DE SEGURANÇA DA CONTA
Conceituação#
Este método é responsável por retornar todas mensagens que estão em sua fila aguardando para ser processada.

Atributos#
Obrigatórios#
Atributos	Tipo	Descrição
page	integer	Utilizado para paginação você de informar aqui a pagina de mensagens que quer buscar
pageSize	integer	Especifica o tamanho do retorno de mensagens por pagina
Opcionais#
Atributos	Tipo	Descrição
count	string	Atributo utilizado para retornar o número de mensagens na fila
Request Params#
URL exemplo#
Método

GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/queue?page=1&pageSize=100

ou

GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/queue/count

Response#
200#
Atributos	Tipo	Descrição
messages	array string	Array com as menssagens da fila
Array Messages

Atributos	Tipo	Descrição
_id	string	ID da mensagem no Z-API
DelayMessage	string	Tempo em segundos entre o envio das mensagens
Message	string	Texto da Mensagem
IsTrial	boolean	Indica se a instância está utilizando trial
InstanceId	string	ID da instância
Phone	string	Número do destinatário
ZaapId	string	ID da mensagem no Z-API
DelayTyping	string	Duração do indicador do chat "digitando..."
MessageId	string	ID da mensagem
Created	timetamp	Data da mensagem
Exemplo

{
  [
    {
      "_id": "39BB1684570F00E91090F6BBC7EE7646",
      "DelayMessage": -1,
      "Message": "Mensagem da fila 1",
      "IsTrial": false,
      "InstanceId": "3A5D07856DC26A1C9E2E08E691E63271",
      "Phone": "5511999999999",
      "ZaapId": "39BB1684570F00E91090F6BBC7EE7646",
      "DelayTyping": 0,
      "MessageId": "7AD29EAA5EF34C301F0B",
      "Created": 1624977905648,
      
    },
    {
      "_id": "39BB1684570F00E91090F6BBC7EE7646",
      "DelayMessage": -1,
      "Message": "Mensagem da fila 2",
      "IsTrial": false,
      "InstanceId": "3A5D07856DC26A1C9E2E08E691E63271",
      "Phone": "5511999999999",
      "ZaapId": "39BB1684570F00E91090F6BBC7EE7646",
      "DelayTyping": 5,
      "MessageId": "7AD29EAA5EF34C301F0B",
      "Created": 1624977906907,
    }
  ]
}
405#
Neste caso certifique que esteja enviando o corretamente a especificação do método, ou seja verifique se você enviou o POST ou GET conforme especificado no inicio deste tópico.

415#
Caso você receba um erro 415, certifique de adicionar na headers da requisição o "Content-Type" do objeto que você está enviando, em sua grande maioria "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/queue");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "accept: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Apagando uma Fila
Método#
/queue#
DELETE https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/queue

Header#
Key	Value
Client-Token	TOKEN DE SEGURANÇA DA CONTA
Conceituação#
Este método é responsável por DELETAR todas mensagens que estão em sua fila aguardando para ser processada.

Atributos#
Obrigatórios#
Atributos	Tipo	Descrição
Opcionais#
Atributos	Tipo	Descrição
Request Params#
URL exemplo#
Método

DELETE https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/queue

Response#
200#
405#
Neste caso certifique que esteja enviando o corretamente a especificação do método, ou seja verifique se você enviou o POST ou GET conforme especificado no inicio deste tópico.

415#
Caso você receba um erro 415, certifique de adicionar na headers da requisição o "Content-Type" do objeto que você está enviando, em sua grande maioria "application/json"

Webhook Response#
Link para a response do webhook (ao receber)

Webhook

Code#

Apagando mensagem fila
Método#
/queue/{zaapid}#
DELETE https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/queue/{zaapid}

Header#
Key	Value
Client-Token	TOKEN DE SEGURANÇA DA CONTA
Conceituação#
Este método é responsável por deletar uma mensagem dentro de fila aguardando para ser processada.

Atributos#
Obrigatórios#
Atributos	Tipo	Descrição
Opcionais#
Atributos	Tipo	Descrição
Request Params#
URL exemplo#
Método

DELETE https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/queue/{zaapid}

Response#
200#
405#
Neste caso certifique que esteja enviando o corretamente a especificação do método, ou seja verifique se você enviou o POST ou GET conforme especificado no inicio deste tópico.

415#
Caso você receba um erro 415, certifique de adicionar na headers da requisição o "Content-Type" do objeto que você está enviando, em sua grande maioria "application/json"

Webhook Response#
Link para a response do webhook (ao receber)

Webhook

Code#


URL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "DELETE");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/queue/5511999999999");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);
Introdução
Sobre o WhatsApp Business#
Agora temos novas APIs para o WhatsApp Business:

Criar ou editar um produto
Pegar meu catalogo de produtos
Pegar catalogo de produtos de outro número business
Pegar dados de um produto por ID
Excluir um produto por ID
note
Todas as novas APIs só funcionam em WhatsApp Business, e também são disponíveis apenas para WhatsApp Business que utilizam o "Multi Device"

Criar/editar Produto
Método#
/products#
POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/products

Header#
Key	Value
Client-Token	TOKEN DE SEGURANÇA DA CONTA
Conceituação#
Nesse método você será capaz de cadastrar e atualizar um produto no seu catálogo

Atributos#
Obrigatórios#
Atributos	Tipo	Descrição
currency	string	Tipo da Moeda
description	string	Descrição do produto
images	string	Url da imagem do produto
isHidden	boolean	Atributo para "esconder" o produto no catálogo
name	string	Nome do produto
price	integer	Preço do produto
salePrice	integer	Preço promocional
retailerId	string	Id do produto
url	string	Url da rota do z-api
Request Body#
{
  "currency": "BRL",
  "description": "Uma descricao do produto",
  "images": ["https://avatars.githubusercontent.com/u/60630101?s=200&v=4"],
  "isHidden": false,
  "name": "Meu primeiro produto",
  "price": 20,
  "salePrice": 18,
  "retailerId": "002",
  "url": "https://z-api.io"
}
Response#
200#
Atributos	Tipo	Descrição
id	string	Id do produto
Exemplo

{
  "id": "4741575945866725"
}
405#
Neste caso certifique que esteja enviando o corretamente a especificação do método, ou seja verifique se você enviou o POST ou GET conforme especificado no inicio deste tópico.

415#
Caso você receba um erro 415, certifique de adicionar na headers da requisição o "Content-Type" do objeto que você está enviando, em sua grande maioria "application/json"

Webhook Response#
Link para a response do webhook (ao receber)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/products");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"currency\": \"BRL\", \"description\": \"Uma descricao do produto*\", \"images\": \"https://avatars.githubusercontent.com/u/60630101?s=200&v=4\", \"isHidden\": \"false\", \"name\": \"Meu primeiro produto\", \"price\": \"20\", \"integrationId\": \"002\", \"url\": \"https://z-api.io\"}");

CURLcode ret = curl_easy_perform(hnd);

Get Products
Method #
/catalogs#
GET https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/catalogs

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
In this method you will be able to get products from a WhatsApp Business catalog

Response#
200#
Attributes	Type	Description
cartEnabled	boolean	Attribute to know if the cart is active
availability	string	Attribute to know product availability
id	string	Product ID
retailerId	boolean	Retailer ID
description	string	Product Description
price	string	Product price
salePrice	string	Promotional price
currency	string	Currency type
name	string	Product name
quantity	boolean	Product quantity attribute
images	string	Product image link
Example

{
  "cartEnabled": true,
  "products":[ 
    {
      "availability": "in stock",
      "id": "999999999999999",
      "retailerId" : null , 
      "description": "Descriçao do mouse",
      "price": "100000",
      "salePrice": "90000",
      "currency":"BRL", 
      "name": "Mouse",
      "quantity": null,
      "images": ["https://"]
    }
  ]
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/catalogs");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"cartEnabled\": \"true\", \"availability\": \"in stock*\", \"id\": \"999999999999999\", \"retailerId\": \"null\", \"price\": \"100000\", \"currency\": \"BRL\", \"name\": \"Mouse\", \"quantity\": \"null\", \"images\": \"https://\"}");

CURLcode ret = curl_easy_perform(hnd);

Pick Up Products (Phone)
Method #
/catalogs/Phone-Number #
GET https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/catalogs/{{Numero-de-telefone}}

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
In this method you will be able to get products from a WhatsApp Business catalog from any number, whether it is your catalog or someone else's.

Attributes #
Optional #
Attributes	Type	Description
nextCursor	string	Token used for record pagination
Request Params#
Example URL #
Method

GET https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/catalogs/{{Numero-de-telefone}}?nextCursor=VALOR_DO_CURSOR

Response#
200#
Attributes	Type	Description
cartEnabled	boolean	Attribute to know if the cart is active
nextCursor	string	Token that defines the records of the next request
availability	string	Attribute to know product availability
id	string	Product ID
retailerId	boolean	Retailer ID
description	string	Product Description
price	string	Product price
salePrice	string	Promotional price
currency	string	Currency type
name	string	Product name
quantity	boolean	Product quantity attribute
images	string	Product image link
Example

{
  "cartEnabled":true, 
  "products":[ 
    {
      "availability":"in stock", 
      "id": "99999999999999999",
      "retailerId" : null , 
      "description":"Descriçao do mouse", 
      "price":"100000", 
      "salePrice":"90000", 
      "currency":"BRL", 
      "name":"Mouse", 
      "quantity":null, 
      "images":["https://"] 
    }
  ]
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

Get Product (Id)
Method #
/products/id-do-produto#
GET https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/products/{{Id-do-produto}}

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
In this method you will be able to get a product by its id

Response#
200#
Attributes	Type	Description
cartEnabled	boolean	Attribute to know if the cart is active
availability	string	Attribute to know product availability
id	string	Product ID
retailerId	boolean	Retailer ID
description	string	Product Description
price	string	Product price
salePrice	string	Promotional price
currency	string	Currency type
name	string	Product name
quantity	boolean	Product quantity attribute
images	string	Product image link
Example

{
  "cartEnabled":true, 
  "catalogId": "99999999999999999",
  "product": {
    "availability":"in stock", 
    "id": "99999999999999",
    "retailerId" : null , 
    "description":"Descriçao do mouse", 
    "price": "20000",
    "salePrice":"90000", 
    "currency":"BRL", 
    "name" : "My first product" , 
    "images":["https://"] 
  }
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/products/%7B%7BId-do-produto%7D%7D");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"cartEnabled\": \"true\", \"availability\": \"in stock*\", \"id\": \"999999999999999\", \"retailerId\": \"null\", \"price\": \"100000\", \"currency\": \"BRL\", \"name\": \"Mouse\", \"quantity\": \"null\", \"images\": \"https://\"}");

CURLcode ret = curl_easy_perform(hnd);

Delete Product
Method #
/products/id-do-produto#
DELETE https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/products/{{id-do-produto}}

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
In this method you will be able to delete a product by its id

Response#
200#
Attributes	Type	Description
success	boolean	Confirmation attribute
Example

{
  "success":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "DELETE");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/product/%7B%7Bid-do-produto%7D%7D");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"succsess\": \"true\"}");

CURLcode ret = curl_easy_perform(hnd);

Search tags
Method #
/tags#
GET https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/tags

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
In this method, you search for all your labels registered on your WhatsApp Business.

Important
This method is only available for devices connected to the Multi-Devices version of WhatsApp.

Response#
200#
Attributes	Type	Description
id	string	id of the label
name	string	Tag name
color	string	label color identifier
Example

[
    {
        "id":"1", 
        "name" : "New customer" , 
        "color": 1
    },
    {
        "id":"2", 
        "name" : "New order" , 
        "color": 2
    },
    {
        "id":"3", 
        "name" : "Payment pending" , 
        "color": 0
    },
    {
        "id": "4",
        "name" : "Payment" , 
        "color": 3
    },
    {
        "id": "5",
        "name" : "Order completed" , 
        "color": 5
    }
]
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"


Label cores
Method #
/business/tags/colors#
GET https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/business/tags/colors

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Using this method, you can list the available label colors.

Important
This method is only available for WhatsApp Business accounts.

Response#
200#
Attributes	Type	Description
{{INDICE_DA_COR}}	string	Hexadecimal code
Example

{
  "0" : "#FF9485" , 
  "1": "#64C4FF",
  "2": "#FFD429"
}
Tip
Colors may vary between different platforms (Android / IPhone)

405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/business/tags/colors");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Create new label
Method #
/business/create-tag#
POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/business/create-tag

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Using this method, you can create a new label. Once you create a label, it becomes available for use when assigning it to a chat.

Important
This method is only available for WhatsApp Business accounts.

Attributes #
Mandatory #
Attributes	Type	Description
name	string	Tag name
Optional #
Attributes	Type	Description
color	number	Key (index) of the desired color. This value should be set according to the available colors, which can be found in this API.
Request Body#
{
  "name" : "Tag name" 
}

{
  "name" : "Tag Name" , 
  "color":1 
}
Response#
200#
Attributes	Type	Description
id	string	ID of the tag that was created
Example

{
  "id": "10"
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/business/create-tag");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"name\": \"Tag name\", \"color\": 1}");

CURLcode ret = curl_easy_perform(hnd);

Edit label
Method #
/business/edit-tag/{{ID_DA_ETIQUETA}} #
POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/business/edit-tag/{{ID_DA_ETIQUETA}}

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Using this method, you can edit a label.

Important
This method is only available for WhatsApp Business accounts.

Attributes #
Mandatory #
Attributes	Type	Description
name	string	New label name
Optional #
Attributes	Type	Description
color	number	Key (index) of the desired new color. This value should be set according to the available colors, which can be found in this API.
Request Params#
Example URL #
Method

POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/business/edit-tag/{{ID_DA_ETIQUETA}}

Request Body#
{
  "name" : "Tag name" 
}

{
  "name" : "Tag Name" , 
  "color":2 
}
Response#
200#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
Example

{
  "success":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/business/edit-tag/%7B%7BTAG_ID%7D%7D");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"name\": \"Tag name\", \"color\": 2}");

CURLcode ret = curl_easy_perform(hnd);

Delete tag
Method #
/business/tag/{{ID_DA_ETIQUETA}}#
DELETE https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/business/tag/{{ID_DA_ETIQUETA}}

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Using this method, you can delete a tag.

Important
This method is only available for WhatsApp Business accounts.

Request Params#
Example URL #
Method

DELETE https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/business/tag/{{ID_DA_ETIQUETA}}

Response#
200#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
Example

{
  "success":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "DELETE");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/business/tag/%7B%7BID_DA_ETIQUETA%7D%7D");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Assign tags to a chat
Method #
/chats/{phone}/tags/{tag}/add#
PUT https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/chats/{phone}/tags/{tag}/add

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Using this method, you can assign a label to a chat on WhatsApp Business.

Important
This method is only available for devices connected to the Multi-Devices version of WhatsApp.

Response#
200#
Attributes	Type	Description
value	boolean	true if it worked and false if it failed
Example

{
  "value":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Remove tags from a chat
Method #
/chats/{phone}/tags/{tag}/remove#
PUT https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/chats/{phone}/tags/{tag}/remove

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Using this method, you can remove labels from a chat on WhatsApp Business.

Important
This method is only available for devices connected to the Multi-Devices version of WhatsApp.

Response#
200#
Attributes	Type	Description
value	boolean	true if it worked and false if it failed
Example

{
    "value":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"


Catalog configuration
Method #
/catalogs/config#
POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/catalogs/config

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Using this method you will be able to edit your catalog settings.

Attributes #
Mandatory #
Attributes	Type	Description
cartEnabled	string	Enable or disable the cart
Request Body#
{
  "cartEnabled": true
}
Response#
200#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
Example

{
  "success":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/catalogs/config");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"cartEnabled\": true}");

CURLcode ret = curl_easy_perform(hnd);

Create collection
Method #
/catalogs/collection#
POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/catalogs/collection

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Using this method you will be able to create a collection of products in your catalog.

Attributes #
Mandatory #
Attributes	Type	Description
name	string	Collection name
productIds	array string	IDs of the products that will be part of the collection
Request Body#
{
  "name" : "Collection Name" , 
  "productIds": ["121212121212", "232323232323"]
}
Response#
200#
Attributes	Type	Description
collectionId	string	Collection ID
Example

{
  "collectionId": "123456789123"
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/catalogs/collection");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"name\": \"Collection name\", \"productIds\": [\"121212121212\", \"232323232323\"]}");

CURLcode ret = curl_easy_perform(hnd);

List collections
Method #
/catalogs/collection#
GET https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/catalogs/collection

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Using this method you will be able to list the collections in your catalog.

Attributes #
Optional #
Attributes	Type	Description
nextCursor	string	Token used for record pagination
Request Params#
Example URL #
Method

GET https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/catalogs/collection?nextCursor=VALOR_DO_CURSOR

Response#
200#
Attributes	Type	Description
collections	array object	List with collection data
nextCursor	string ou null	Token that defines the records of the next request
Object (collections)

Attributes	Type	Description
id	string	Collection ID
name	string	Collection name
status	string	Collection status (PENDING, APPROVED)
Example

{
  "nextCursor" : "AQHRi6eu3NyRTR30t5Sr2CtkURU7rMF_e2K7NPbELxJFAa-K_HI1I6v8_C3o2j6d4wve" , 
  "collections": [
    {
      "id": "1072603710847740",
      "name" : "Collection Name" , 
      "status": "PENDING"
    },
    {
      "id": "902834786123343",
      "name" : "Collection Name 2" , 
      "status": "APPROVED"
    }
  ]
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

---retailerId

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/catalogs/collection?nextCursor=CURSOR_VALUE");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Delete collection
Method #
/catalogs/collection/{{collection-id}} #
DELETE https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/catalogs/collection/{{id-da-coleção}}

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Using this method you will be able to delete a collection of products from your catalog.

Response#
200#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
Example

{
  "success":true 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "DELETE");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/catalogs/collection/123123123123");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Edit collection
Method #
/catalogs/collection-edit/{{collection-id}} #
POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/catalogs/collection-edit/{{id-da-coleção}}

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Using this method you will be able to edit a collection of products from your catalog.

Attributes #
Mandatory #
Attributes	Type	Description
name	string	New collection name
Request Body#
{
  "name" : "New collection name" 
}
Response#
200#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
collectionId	string	Collection ID
Example

{
  "success":true, 
  "collectionId": "228078660281007"
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/catalogs/collection-edit/228078660281007");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"name\": \"New collection name\"}");

CURLcode ret = curl_easy_perform(hnd);

List products in a collection
Method #
/catalogs/collection-products/{{telefone-dono-catalogo}}#
GET https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/catalogs/collection-products/{{telefone-dono-catalogo}}

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Using this method you will be able to list the products that are part of a collection in your catalog.

Attributes #
Mandatory #
Attributes	Type	Description
collectionId	string	Collection ID
Optional #
Attributes	Type	Description
nextCursor	string	Token used for record pagination
Request Params#
Example URL #
Method

GET https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/catalogs/collection-products/{{numero-de-telefone-dono-catalogo}}?collectionId=12312312312&nextCursor=VALOR_DO_CURSOR

Response#
200#
Attributes	Type	Description
nextCursor	string ou null	Token that defines the records of the next request
products	array object	List with product data
Object (products)

Attributes	Type	Description
id	string	Product ID
name	string	Product name
description	string	Product Description
url	string	Product URL
price	string	Product price
currency	string	Currency type
isHidden	boolean	Hidden product
availability	string	Attribute to know product availability
retailerId	string	Retailer ID
images	string	Product image link
quantity	string	Product quantity attribute
Example

{
  "nextCursor": null,
  "products":[ 
    {
      "id": "6988917394481455",
      "name" : "Product Name" , 
      "description" : "Product Description" , 
      "url" : "http://site.com/produto" , 
      "price": "10000",
      "currency":"BRL", 
      "isHidden" : false , 
      "availability":"in stock", 
      "retailerId" : "123" , 
      "images": [
          "https://cdn.greatsoftwares.com.br/arquivos/paginas/10603-92bb9420b363835d05d41b96a45d8f4e.png"
      ],
      "quantity": "99"
    }
  ]
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/catalogs/collection-products/554412121212?collectionId=12312312313&nextCursor=CURSOR_VALUE");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Add products to collection
Method #
/catalogs/collection/add-product#
POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/catalogs/collection/add-product

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Using this method you will be able to add products to a collection in your catalog.

Attention
When adding or removing products from a collection , WhatsApp changes its ID. This means that adding a product to the collection and attempting any other operation using the "old" ID will result in the route not working. Remember to use the ID returned by this same route, which is already the updated ID for subsequent operations.

Attributes #
Mandatory #
Attributes	Type	Description
collectionId	string	Collection ID
productIds	array string	IDs of the products that will be part of the collection
Request Body#
{
  "collectionId": "658387616418640",
  "productIds": ["6643149779134830", "6988917394481455"]
}
Response#
200#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
collectionId	string	Updated collection ID
Example

{
  "success":true, 
  "collectionId": "1798362193933497"
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/catalogs/collection/add-product");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"collectionId\": \"658387616418640\", \"productIds\": [\"121212121212\", \"232323232323\"]}");

CURLcode ret = curl_easy_perform(hnd);

Remove products from the collection
Method #
/catalogs/collection/remove-product#
POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/catalogs/collection/remove-product

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Using this method you will be able to remove products from a collection in your catalog.

Attention
When adding or removing products from a collection , WhatsApp changes its ID. This means that adding a product to the collection and attempting any other operation using the "old" ID will result in the route not working. Remember to use the ID returned by this same route, which is already the updated ID for subsequent operations.

Attributes #
Mandatory #
Attributes	Type	Description
collectionId	string	Collection ID
productIds	array string	IDs of products that will be removed from the collection
Request Body#
{
  "collectionId":"658387616418640", 
  "productIds":["6643149779134830","6988917394481455"]  
}
Response#
200#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
collectionId	string	Updated collection ID
Example

{
  "success":true, 
  "collectionId":"1798362193933497" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/catalogs/collection/remove-product");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"collectionId\": \"658387616418640\", \"productIds\": [\"121212121212\", \"232323232323\"]}");

CURLcode ret = curl_easy_perform(hnd);

Change company description
Method #
/business/company-description#
POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/business/company-description

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Through this method, it is possible to change the company description.

Important
This method is only available for WhatsApp Business accounts.

Attributes #
Optional #
Attributes	Type	Description
value	string	Company Description
Request Body#
{
  "value" : "Description text" 
}
Tip
To remove the description, simply send the "value" attribute as empty.

Response#
201#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
Example

{
  "success":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/business/company-description");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"value\": \"Text description\"}");

CURLcode ret = curl_easy_perform(hnd);

Change company email
Method #
/business/company-email#
POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/business/company-email

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Through this method, it is possible to change the company's contact email.

Important
This method is only available for WhatsApp Business accounts.

Attributes #
Optional #
Attributes	Type	Description
value	string	Company email
Request Body#
{
  "value": "email@example.com"
}
Email format
Please note that the submitted field must be in a valid email format. Filling this value with text that is not in the email format will result in an error.

Tip
To remove the email, simply send the "value" attribute as empty.

Response#
201#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
Example

{
  "success":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/business/company-email");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"value\": \"email@example.com\"}");

CURLcode ret = curl_easy_perform(hnd);

Change the company's business address
Method #
/business/company-address#
POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/business/company-address

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Through this method, it is possible to change the business address of the company.

Important
This method is only available for WhatsApp Business accounts.

Attributes #
Optional #
Attributes	Type	Description
value	string	Company address
Request Body#
{
  "value" : "Company Address" 
}
Tip
To remove the address, simply send the "value" attribute as empty.

Response#
201#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
Example

{
  "success":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/business/company-address");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"value\": \"Company address\"}");

CURLcode ret = curl_easy_perform(hnd);

Change company websites
Method #
/business/company-websites#
POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/business/company-websites

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Through this method, it is possible to change the company/company websites.

Important
This method is only available for WhatsApp Business accounts.

Attributes #
Optional #
Attributes	Type	Description
websites	string[]	Company websites
Request Body#
{
  "websites": ["https://example.com", "https://example2.org"]
}
warning
A company can only have two (2) registered websites. Submitting more than two items in the request will result in an error.

Website URL format
The URL format of websites must be valid. Submitting an invalid URL will result in an error. URL format guide: https://developers.google.com/search/docs/crawling-indexing/url-structure?hl=pt-br

Tip
To remove the address, simply send the "websites" attribute as empty.

Response#
201#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
Example

{
  "success":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/business/company-websites");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"websites\": [\"https://example.com\", \"https://example2.org\"]}");

CURLcode ret = curl_easy_perform(hnd);

Change opening hours
Method #
/business/hours#
POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/business/hours

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Through this method, it is possible to change the company's opening hours.

Important
This method is only available for WhatsApp Business accounts.

Attributes #
Mandatory #
Attributes	Type	Description
timezone	string	Time zone location
Options #
Attributes	Type	Description
mode	string	Operating mode (specificHours, open24h, appointmentOnly)
days	array object	Days of the week the company operates
Object (days)

Attributes	Type	Description
dayOfWeek	string	Dia da semana (SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY)
openTime	string	Opening time (hh:mm format)
closeTime	string	Closing time (hh:mm format)
Request Body#
{
  "timezone": "America/Sao_Paulo",
  "days": [
    {
      "dayOfWeek": "MONDAY",
      "openTime": "08:00",
      "closeTime": "12:00"
    },
    {
      "dayOfWeek":"MONDAY", 
      "openTime": "14:00",
      "closeTime": "18:00"
    }
  ],
  "mode": "specificHours"
}
Tip
To set all days as "closed", simply send the "days" attribute as empty

Response#
201#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
Example

{
  "success":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/business/hours");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"timezone\": \"America/Sao_Paulo\",\"days\": [{\"dayOfWeek\": \"MONDAY\",\"openTime\": \"08:00\",\"closeTime\": \"12:00\"},{\"dayOfWeek\": \"MONDAY\",\"openTime\": \"14:00\",\"closeTime\": \"18:00\"}],\"mode\": \"specificHours\"}");

CURLcode ret = curl_easy_perform(hnd);

List categories
Method #
/business/available-categories?query={{STRING_DE_BUSCA (opcional)}}#
GET https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/business/available-categories

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Through this method, it is possible to list the categories available to assign to the company/company.

Important
This method is only available for WhatsApp Business accounts.

Attributes #
Options #
Attributes	Type	Description
query	string	Category search parameter. Example: "technology"
Request Params#
Example URL #
Method

GET https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/business/available-categories?query=tecnologia

Response#
200#
Attributes	Type	Description
Size	string	Category name to be displayed
id	string	Category identifier. Must be sent when requesting to assign categories to the company.
label	(Opcional) string	It can also be informed in the request to assign categories to the company.
Example

[
  {
    "displayName" : "Other Companies" , 
    "label": "OTHER_COMPANIES",
    "id": "629412378414563"
  },
  {
    "displayName" : "Automotive Service" , 
    "id": "1223524174334504"
  }
]
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/business/available-categories");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Assign categories
Method #
/business/categories#
POST https://api.z-api.io/instances/{{instanceId}}/token/{{instanceToken}}/business/categories

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Through this method, it is possible to assign categories to the company.

Important
This method is only available for WhatsApp Business accounts.

Attention
It is possible to register a maximum of 3 categories for the company, and it is necessary to have at least one.

Attributes #
Mandatory #
Attributes	Type	Description
categories	array string	ID or label of the category to be assigned. Can be obtained from the List Categories API.
Request Body#
{
  "categories": ["RESTAURANT", "FINANCE", "629412378414563"]
}
Important
The values ​​sent in the "categories" attribute must be the same as those returned in the " List categories " request, in the "id" or "label" property. The "id" property is useful when the "label" property is not returned. This is the only way to identify the desired category to be assigned.

Response#
201#
Attributes	Type	Description
success	boolean	true if it worked and false if it failed
Example

{
  "success":true 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/business/categories");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"categories\": [\"EDUCATION\"]}");

CURLcode ret = curl_easy_perform(hnd);

Introduction
Conceptualization #
In this topic we will talk about the RETURNS of the webhooks we use.

Z-API instances make POST requests for events performed by them to a previously configured URL. Each request has a specific JSON body, which will be described below.

Important
Your endpoint needs to accept a POST

These endpoints are to change the URL that the instance will call when the event happens.

What is it and what is it for? #
According to Google, a Webhook is an internet resource used to allow one application to communicate with another, providing real-time data whenever an event occurs. This way, the two systems exchange information without requiring any external action.

So, if you're integrating with Z-API and need to receive information via WhatsApp, you'll need to provide these endpoints in your application so we can notify you of everything happening on your WhatsApp. In other words, every time the connected number receives an interaction, we'll make a POST request to the previously configured URL. (Each request has a specific JSON body.)

Our webhooks #
Delivery#
Responsible for notifying you that your message was delivered to WhatsApp, but this does not necessarily mean that your contact received it. For receipt and reading information, you will need to observe the status webhook.

Receive#
This webhook will be called every time someone interacts with your number on WhatsApp.

Status#
This method will notify you of any status changes your message undergoes, whether it is received, read, replied to or deleted. In other words, the same message can go through several statuses, and have the same status more than once, which is the case of replied.

Disconnected#
This webhook will be called whenever our service identifies any unavailability in communication, whether from your cell phone to WhatsApp or even the connection between your cell phone and Z-API.

Tip
Be sure to read our tips section, where you'll find some topics on how to improve your Z-API connection and get better service quality.

You don't need to configure all webhooks, but the more control you have over your instance, the more you will be able to extract resources and develop business with Z-API.

Important
Never share your ID and token with anyone.

How do I set up my Webhook? #
You can update an instance's webhook in two different ways.

Via panel #
Access our admin panel, in Instances click on the "view" eye on the instance you want and on the 3 dots choose "edit".

img

Via api #
You can also update your webhook's route by calling the update endpoint. This endpoint is available in the next documentation topics.

When sending
Conceptualization #
This is the return webhook for sent messages

Attention
Z-API does not accept non-HTTPS webhooks

Updating Webhook #
To update the webhook route, you can do so via the API or the administrative panel.

Tip
You can change all webhooks at once to the same URL. See endpoint .

API#
/update-webhook-delivery#
PUT https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-webhook-delivery

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Request Body#
{
  "value": "https://endereco-do-seu-sistema.com.br/instancia/SUA_INSTANCIA/delivery"
}
Administrative Panel #
img

Returns two webhooks #
The possible returns of the on-message-send webhook are listed below:

Response#
Attributes	Type	Description
phone	string	Message destination phone number.
zaapId	string	Message identifier in the conversation.
type	string	Instance event type, in this case it will be "DeliveryCallback".
200#
{
  "phone":"554499999999", 
  "zaapId" : "A20DA9C0183A2D35A260F53F5D2B9244" , 
  "messageId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "type": "DeliveryCallback",
  "instanceId": "instance.id"
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Upon receiving
Conceptualization #
This is the return webhook for received messages, it is also executed when your instance is configured to also notify messages sent by yourself.

What is the expiration date of z-api files?
All media files received from z-api through your webhook have a 30-day expiration period . After this period, all files, whether audio, PDF, image, etc., will be deleted from storage.

Attention
Z-API does not accept non-HTTPS webhooks

Updating Webhook #
To update the webhook route, you can do so via the API or the administrative panel.

Tip
You can change all webhooks at once to the same URL. See endpoint .

API#
/update-webhook-received#
PUT https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-webhook-received

Or #
It is also possible to update the route with the "sent by me" option enabled.

/update-webhook-received-delivery#
PUT https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-webhook-received-delivery

img

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Request Body#
{
  "value": "https://endereco-do-seu-sistema.com.br/instancia/SUA_INSTANCIA/receive"
}
Administrative Panel #
img

Returns two webhooks #
The possible returns of the on-message-received webhook are listed below:

Response#
Attributes	Type	Description
isStatusReply	boolean	Identifies whether the received message is a status response
senderLid	string	WhatsApp Contact ID
connectedPhone	string	Phone number connected to the API
waitingMessage	boolean	Identifies whether your message has a "Waiting for message" status
isEdit	boolean	Identifies whether the received message has been edited
isGroup	boolean	Indicates whether the chat is a group
isNewsletter	boolean	Indicates whether the chat is a channel
phone	string	Phone number, or group number that sent the message.
fromMe	boolean	Indicates whether the message sent came from the number connected to the API
participantPhone	string	Phone number of the group member who sent the message.
participantLid	string	WhatsApp contact ID of the participant who sent the message within a group
messageId	string	Message identifier in the conversation.
status	string	Status of the message at the time of sending (PENDING, SENT, RECEIVED, READ or PLAYED).
referenceMessageId	string	Reference to the message that was replied to in case the received message was a reply to a message in the conversation.
momment	integer	Time the message was received or the error occurred.
messageExpirationSeconds	integer	Temporary message timing
requestMethod	string	Input request method identifier ( invite_linkor non_admin_add)
type	string	Instance event type, in this case it will be "ReceivedCallBack".
photo	string	Photo URL of the user who sent the message.
text.message	string	Message text.
image.caption	string	Photo link.
image.imageUrl	string	Url from photo.
image.thumbnailUrl	string	Photo thumbnail URL.
image.mimeType	string	MimeType of the image.
audio.mimeType	string	Audio MimeType.
audio.audioUrl	string	Audio URL.
video.caption	string	Video caption.
video.videoUrl	string	Video URL.
video.mimeType	string	MimeType of the video.
contact.displayName	string	Contact name.
contact.vCard	string	VCard containing contact information.
document.mimeType	string	MimeType of the document.
document.fileName	string	Document name.
document.title	string	Document title.
document.pageCount	string	Number of pages in the document.
document.thumbnailUrl	string	Document thumbnail URL.
document.documentUrl	string	Document URL.
location.thumbnailUrl	string	Location thumbnail url.
location.longitude	float	Longitude of location.
location.latitude	float	Latitude of location.
location.url	string	Location URL.
location.name	string	Location name.
location.address	string	Location address.
sticker.mimeType	string	MimeType do sticker.
sticker.stickerUrl	string	Url do sticker.
200#
Text return example #
{
  "isStatusReply": false,
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1632228638000,
  "status": "RECEIVED",
  "chatName": "name",
  "senderPhoto": "https://",
  "senderName": "name",
  "participantPhone": null,
  "participantLid": null,
  "photo": "https://",
  "broadcast": false,
  "type": "ReceivedCallback",
  "text": {
    "message" : "test" , 
    "descritpion" : "(optional) if the message has a description inserted by WhatsApp" , 
    "title" : "(optional) if the message has a title inserted by WhatsApp" , 
    "url" : "(optional) if the message has a link attached to it. Example: catalog message has a 'View catalog' button" , 
    "thumbnailUrl" : "(optional) if the message has a thumbnail image linked to it. Example: group invitation message has the group image" 
  }
}
Example of returning a text template #
{
  "isStatusReply":false, 
  "chatLid" : "81896604192873@lid" , 
  "connectedPhone":"554499999999", 
  "waitingMessage":false, 
  "isEdit":false, 
  "isGroup":false, 
  "isNewsletter":false, 
  "instanceId": "3C67AB641C8AA0412F6A2242B4E23AC7",
  "messageId": "702CC5F7E0A6BF4421",
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1708457193876,
  "status":"RECEIVED", 
  "chatName": "Test Number",
  "senderPhoto": null,
  "senderName" : "5544999999999" , 
  "photo": null,
  "broadcast": false,
  "participantLid": null,
  "forwarded": false,
  "type": "ReceivedCallback",
  "fromApi": false,
  "hydratedTemplate": {
    "header": {},
    "message" : "message text" , 
    "footer" : "message footer" , 
    "title" : "message title" , 
    "templateId" : "790118069824606" , 
    "hydratedButtons": []
  }
}
React Return Example #
{
  "isStatusReply": false,
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1632228955000,
  "status": "RECEIVED",
  "chatName": "name",
  "senderPhoto": "https://",
  "senderName": "name",
  "participantPhone": null,
  "participantLid":null, 
  "photo": "https://",
  "broadcast":false, 
  "type":"ReceivedCallback", 
  "reaction": {
    "value": "❤️",
    "time": 1651878681150,
    "reactionBy": "554499999999",
    "referencedMessage": {
      "messageId": "3EB0796DC6B777C0C7CD",
      "fromMe" : true , 
      "phone":"5544999999999", 
      "participant": null
    }
  }
}
Example of returning text (Button List) #
{
  "isStatusReply": false,
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1634645380000,
  "status": "RECEIVED",
  "chatName" : "Nome" , 
  "senderPhoto": "https://",
  "senderName" : "Name" , 
  "participantPhone": null,
  "participantLid": null,
  "photo": "https://",
  "broadcast": false,
  "referenceMessageId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "forwarded": false,
  "type": "ReceivedCallback",
  "buttonsResponseMessage": {
    "buttonId": "1",
    "message" : "Great" 
  }
}
OTP Button Template Return Example #
{
  "isStatusReply":false, 
  "chatLid" : "81896604192873@lid" , 
  "connectedPhone":"554499999999", 
  "waitingMessage":false, 
  "isEdit":false, 
  "isGroup":false, 
  "isNewsletter":false, 
  "instanceId": "3C67AB641C8AA0412F6A2242B4E23AC7",
  "messageId": "9D968A5FA2880508C4",
  "phone":"554499999999", 
  "fromMe" : false , 
  "momment": 1708455444850,
  "status":"RECEIVED", 
  "chatName": "name",
  "senderPhoto": null,
  "senderName" : "554499999999" , 
  "photo": null,
  "broadcast": false,
  "participantLid": null,
  "forwarded": false,
  "type": "ReceivedCallback",
  "fromApi": false,
  "hydratedTemplate": {
    "header": {},
    "message" : "message text" , 
    "footer": "",
    "title": "",
    "templateId" : "" , 
    "hydratedButtons": [
      {
        "urlButton": {
          "displayText" : "Copy Code" , 
          "url": "https://www.whatsapp.com/otp/code/?otp_type=COPY_CODE&code=otp123"
        },
        "index": 0
      }
    ]
  }
}
Pix key button return example #
{
  "isStatusReply": false,
  "chatLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "3C67AB641C8AA0412F6A2242B4E23AC7",
  "messageId": "9D968A5FA2880508C4",
  "phone":"554499999999", 
  "fromMe" : false , 
  "momment": 1708455444850,
  "status": "RECEIVED",
  "chatName": "name",
  "senderPhoto": null,
  "senderName" : "554499999999" , 
  "photo":null, 
  "broadcast":false, 
  "participantLid":null, 
  "forwarded":false, 
  "type":"ReceivedCallback", 
  "fromApi":false, 
  "pixKeyMessage": {
    "currency":"BRL", 
    "referenceId": "4PXRAHSIRDA",
    "key": "pixkey",
    "keyType": "EVP",
    "merchantName": "Pix"
  }
}
Example of button return with image #
{
  "isStatusReply": false,
  "chatLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "3C67AB641C8AA0412F6A2242B4E23AC7",
  "messageId": "9D968A5FA2880508C4",
  "phone":"554499999999", 
  "fromMe" : false , 
  "momment": 1708455444850,
  "status": "RECEIVED",
  "chatName": "name",
  "senderPhoto": null,
  "senderName" : "554499999999" , 
  "photo": null,
  "broadcast": false,
  "participantLid": null,
  "forwarded": false,
  "type": "ReceivedCallback",
  "fromApi": false,
  "buttonsMessage": {
    "imageUrl" : "Image URL" , 
    "videoUrl": null,
    "message" : "Message text" , 
    "buttons":[ 
      {
        "buttonId": "1",
        "type": 1,
        "buttonText": {
          "displayText" : "Button 1 Text" 
        }
      },
      {
        "buttonId": "2",
        "type":1, 
        "buttonText":{ 
          "displayText" : "Button 2 Text" 
        }
      }
    ]
  }
}
Example of button return with video #
{
  "isStatusReply":false, 
  "chatLid" : "81896604192873@lid" , 
  "connectedPhone":"554499999999", 
  "waitingMessage":false, 
  "isEdit":false, 
  "isGroup":false, 
  "isNewsletter":false, 
  "instanceId":"3C67AB641C8AA0412F6A2242B4E23AC7", 
  "messageId":"9D968A5FA2880508C4", 
  "phone":"554499999999", 
  "fromMe" : false , 
  "momment":1708455444850, 
  "status":"RECEIVED", 
  "chatName":"name", 
  "senderPhoto":null, 
  "senderName" : "554499999999" , 
  "photo":null, 
  "broadcast":false, 
  "participantLid":null, 
  "forwarded":false, 
  "type":"ReceivedCallback", 
  "fromApi":false, 
  "buttonsMessage":{ 
    "imageUrl": null,
    "videoUrl": "URL do video",
    "message" : "Message text" , 
    "buttons":[ 
      {
        "buttonId":"1", 
        "type":1, 
        "buttonText":{ 
          "displayText" : "Button 1 Text" 
        }
      },
      {
        "buttonId":"2", 
        "type":1, 
        "buttonText":{ 
          "displayText" : "Button 2 Text" 
        }
      }
    ]
  }
}
Example of returning text (Option List) #
{
  "isStatusReply":false, 
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone":"554499999999", 
  "waitingMessage":false, 
  "isEdit":false, 
  "isGroup":false, 
  "isNewsletter":false, 
  "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1634645683000,
  "status":"RECEIVED", 
  "chatName" : "Nome" , 
  "senderPhoto": "https://",
  "senderName" : "Name" , 
  "participantPhone": null,
  "participantLid": null,
  "photo": "https://",
  "broadcast": false,
  "referenceMessageId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "forwarded": false,
  "type": "ReceivedCallback",
  "listResponseMessage" : { 
    "message" : "Z-API Wings for your imagination" , 
    "title":"Z-API", 
    "selectedRowId": "1"
  }
}
Carousel return example #
{
  "isStatusReply": false,
  "chatLid" : null , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"554499999999", 
  "fromMe" : true , 
  "momment": 1739368022130,
  "status": "SENT",
  "chatName" : "Nome" , 
  "senderPhoto": null,
  "senderName" : "Name" , 
  "photo":"https://", 
  "broadcast":false, 
  "participantLid":null, 
  "forwarded":false, 
  "type":"ReceivedCallback", 
  "fromApi": true,
  "carouselMessage": {
    "text" : "Message text" , 
    "cards": [
      {
        "header": {
          "image": {
            "imageUrl": "https://",
            "thumbnailUrl": "https://",
            "caption": "",
            "mimeType": "image/jpeg",
            "viewOnce":false, 
            "width": 0,
            "height": 0
          }
        },
        "message" : "Carousel Card Message" , 
        "footer": "",
        "title": "",
        "hydratedButtons": [
          {
            "index": 0,
            "urlButton": {
              "displayText" : "Button Text" , 
              "url": "https://"
            }
          },
          {
            "index": 1,
            "quickReplyButton" : { "displayText" : "Button Text" , "id" : "2" }      
          }
        ]
      },
      {
        "header": {
          "image": {
            "imageUrl": "https://",
            "thumbnailUrl": "https://",
            "caption": "",
            "mimeType": "image/jpeg",
            "viewOnce":false, 
            "width": 0,
            "height": 0
          }
        },
        "message" : "Carousel Card Message" , 
        "footer":"", 
        "title":"", 
        "hydratedButtons":[ 
          {
            "index":0, 
            "urlButton":{ 
              "displayText" : "Button Text" , 
              "url":"https://" 
            }
          },
          {
            "index":1, 
            "quickReplyButton" : { "displayText" : "Button Text" , "id" : "2" }      
          }
        ]
      }
    ]
  }
}
Example of text return from ad #
{
    "isStatusReply": false,
    "senderLid" : "81896604192873@lid" , 
    "connectedPhone": "554499999999",
    "waitingMessage": false,
    "isGroup": false,
    "isEdit": false,
    "isNewsletter": false,
    "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
    "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
    "phone":"5544999999999", 
    "fromMe" : false , 
    "momment": NumberLong(1657209752000),
    "status": "RECEIVED",
    "chatName": "name",
    "senderPhoto": null,
    "senderName": "name",
    "photo": null,
    "broadcast": false,
    "externalAdReply": {
        "title" : "Title" , 
        "body" : "ad text" , 
        "mediaType": NumberInt(1),
        "thumbnailUrl": "https://",
        "sourceType": "ad",
        "sourceId": "23722824350495506",
        "ctwaClid": "Aff-niaAw7V94N8LGd79Vjr43TlJD4UnoBdpZJQ3LzABitbbG6wgKBSVOth4EN0IDr9glsKWjm2LBaFrJG3Nb0ILxP49ZtossVBNzlS8cFXBvv2ow7gNw",
        "sourceUrl": "https://",
        "containsAutoReply": false,
        "renderLargerThumbnail": true,
        "showAdAttribution": true
    },
    "messageExpirationSeconds": NumberInt(0),
    "forwarded": false,
    "type": "ReceivedCallback",
    "text": {
        "message" : "message received" , 
        "description" : "ad text" , 
        "title" : "title" , 
        "url": "https://",
        "thumbnailUrl": "https://"
    }
}
Image return example #
{
  "isStatusReply": false,
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1632228828000,
  "status": "RECEIVED",
  "chatName": "name",
  "senderPhoto": "https://",
  "senderName": "name",
  "participantPhone": null,
  "participantLid": null,
  "photo": "https://",
  "broadcast": false,
  "type": "ReceivedCallback",
  "image": {
    "mimeType": "image/jpeg",
    "imageUrl": "https://",
    "thumbnailUrl": "https://",
    "caption": "",
    "thumbnailUrl":"https://", 
    "width": 600,
    "height": 315,
    "viewOnce": true
  }
}
Image template return example #
{
  "isStatusReply": false,
  "chatLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "3C67AB641C8AA0412F6A2242B4E23AC7",
  "messageId": "885FF934BF100D579E",
  "phone":"554499999999", 
  "fromMe" : false , 
  "momment": 1708454725028,
  "status": "RECEIVED",
  "chatName": "name",
  "senderPhoto": null,
  "senderName" : "554499999999" , 
  "photo": null,
  "broadcast":false, 
  "participantLid":null, 
  "forwarded": false,
  "type":"ReceivedCallback", 
  "fromApi": false,
  "hydratedTemplate": {
    "header": {
      "image":{ 
        "imageUrl": "https://example.jpeg",
        "thumbnailUrl": "https://example.jpeg",
        "caption":"", 
        "mimeType":"image/jpeg", 
        "viewOnce":false, 
        "width": 1600,
        "height": 926
      }
    },
    "message" : "message text" , 
    "footer" : "message footer" , 
    "title" : "message title" , 
    "templateId" : "674504507982622" , 
    "hydratedButtons": []
  }
}
Audio Feedback Example #
{
  "isStatusReply": false,
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1632228849000,
  "status": "RECEIVED",
  "chatName": "name",
  "senderPhoto": "https://",
  "senderName": "name",
  "participantPhone": null,
  "participantLid": null,
  "photo": "https://",
  "broadcast": false,
  "type": "ReceivedCallback",
  "audio": {
    "ptt": true,
    "seconds": 10,
    "audioUrl": "https://",
    "mimeType": "audio/ogg; codecs=opus",
    "viewOnce": true
  }
}
Video Return Example #
{
  "isStatusReply":false, 
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone":"554499999999", 
  "waitingMessage":false, 
  "isEdit":false, 
  "isGroup":false, 
  "isNewsletter":false, 
  "instanceId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1632228889000,
  "status":"RECEIVED", 
  "chatName":"name", 
  "senderPhoto":"https://", 
  "senderName":"name", 
  "participantPhone":null, 
  "participantLid":null, 
  "photo":"https://", 
  "broadcast":false, 
  "type":"ReceivedCallback", 
  "video": {
    "videoUrl": "https://",
    "caption": "",
    "mimeType": "video/mp4",
    "seconds": 13,
    "viewOnce":true 
  }
}
Example of video template return #
{
  "isStatusReply": false,
  "chatLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "3C67AB641C8AA0412F6A2242B4E23AC7",
  "messageId": "0E4AD761B62E3D5EF9",
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1708456287181,
  "status": "RECEIVED",
  "chatName": "name",
  "senderPhoto": null,
  "senderName" : "5544999999999" , 
  "photo": null,
  "broadcast": false,
  "participantLid": null,
  "forwarded": false,
  "type": "ReceivedCallback",
  "fromApi": false,
  "hydratedTemplate": {
    "header": {
      "video": {
        "videoUrl": "https://example.mp4",
        "caption": "",
        "mimeType": "video/mp4",
        "width": 0,
        "height": 0,
        "seconds": 0,
        "viewOnce":false 
      }
    },
    "message" : "message text" , 
    "footer" : "message footer" , 
    "title" : "message title" , 
    "templateId" : "938481574354947" , 
    "hydratedButtons": []
  }
}
PTV return example #
{
  "isStatusReply":false, 
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone":"554499999999", 
  "waitingMessage":false, 
  "isEdit":false, 
  "isGroup":false, 
  "isNewsletter":false, 
  "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : true , 
  "momment": 1688496074000,
  "status": "RECEIVED",
  "chatName" : "me" , 
  "senderPhoto": "https://",
  "senderName": "name",
  "photo": "https://",
  "broadcast": false,
  "participantPhone": "5544999999999",
  "messageExpirationSeconds": 0,
  "forwarded": true,
  "type": "ReceivedCallback",
  "video": {
    "videoUrl": "https://",
    "caption": "",
    "mimeType": "video/mp4"
  }
}
Contact Return Example #
{
  "isStatusReply": false,
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1632228925000,
  "status":"RECEIVED", 
  "chatName": "name",
  "senderPhoto":"https://", 
  "senderName":"name", 
  "participantPhone": null,
  "participantLid": null,
  "photo":"https://", 
  "broadcast":false, 
  "type":"ReceivedCallback", 
  "contact": {
    "displayName": "Cesar Baleco",
    "vCard": "BEGIN:VCARD\nVERSION:3.0\nN:;nome;;;\nFN:nome\nTEL;type=CELL;type=VOICE;waid=5544999999999:+55 44 9999-9999\nEND:VCARD",
    "phones":["5544999999999"] 
  }
}
Document return example #
{
  "isStatusReply":false, 
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone":"554499999999", 
  "waitingMessage":false, 
  "isEdit":false, 
  "isGroup":false, 
  "isNewsletter":false, 
  "instanceId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1632228955000,
  "status":"RECEIVED", 
  "chatName":"name", 
  "senderPhoto":"https://", 
  "senderName":"name", 
  "participantPhone":null, 
  "participantLid":null, 
  "photo":"https://", 
  "broadcast":false, 
  "type":"ReceivedCallback", 
  "document": {
    "documentUrl": "https://",
    "mimeType": "application/pdf",
    "title" : "name" , 
    "pageCount": 1,
    "fileName": "nome.pdf"
  }
}
Example of returning a document template #
{
  "isStatusReply": false,
  "chatLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "3C67AB641C8AA0412F6A2242B4E23AC7",
  "messageId": "9D968A5FA2880508C4",
  "phone":"554499999999", 
  "fromMe" : false , 
  "momment": 1708455444850,
  "status": "RECEIVED",
  "chatName": "name",
  "senderPhoto": null,
  "senderName" : "554499999999" , 
  "photo": null,
  "broadcast": false,
  "participantLid": null,
  "forwarded": false,
  "type": "ReceivedCallback",
  "fromApi": false,
  "hydratedTemplate": {
    "header": {
      "document": {
        "caption": null,
        "documentUrl": "https://example.pdf",
        "mimeType":"application/pdf", 
        "title": "",
        "pageCount": 0,
        "fileName": ""
      }
    },
    "message" : "message text" , 
    "footer" : "message footer" , 
    "title" : "message title" , 
    "templateId" : "811492407484976" , 
    "hydratedButtons": []
  }
}
Location Return Example #
{
  "isStatusReply": false,
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1632228970000,
  "status": "RECEIVED",
  "chatName": "name",
  "senderPhoto": "https://",
  "senderName": "name",
  "participantPhone": null,
  "participantLid": null,
  "photo": "https://",
  "broadcast": false,
  "type": "ReceivedCallback",
  "location":{ 
    "longitude": -99.999999999999999,
    "latitude": -99.9999999999999999,
    "address": "",
    "url": ""
  }
}
Example of localization template return #
{
  "isStatusReply":false, 
  "chatLid" : "81896604192873@lid" , 
  "connectedPhone":"554499999999", 
  "waitingMessage":false, 
  "isEdit":false, 
  "isGroup":false, 
  "isNewsletter":false, 
  "instanceId": "3C67AB641C8AA0412F6A2242B4E23AC7",
  "messageId": "27BBF23E0185D363D9",
  "phone":"554499999999", 
  "fromMe" : false , 
  "momment": 1708456969808,
  "status":"RECEIVED", 
  "chatName":"name", 
  "senderPhoto": null,
  "senderName" : "554499999999" , 
  "photo": null,
  "broadcast":false, 
  "participantLid":null, 
  "forwarded": false,
  "type":"ReceivedCallback", 
  "fromApi": false,
  "hydratedTemplate": {
    "header": {
      "location":{ 
        "longitude": -46.6388,
        "latitude": -23.5489,
        "name" : "place name" , 
        "address" : "address name" , 
        "url": ""
      }
    },
    "message" : "message text" , 
    "footer" : "message footer" , 
    "title" : "message title" , 
    "templateId" : "1143940003434066" , 
    "hydratedButtons": []
  }
}
Example of sticker return #
{
  "isStatusReply": false,
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1632228982000,
  "status": "RECEIVED",
  "chatName": "name",
  "senderPhoto": "https://",
  "senderName": "name",
  "participantPhone": null,
  "participantLid": null,
  "photo": "https://",
  "broadcast": false,
  "type": "ReceivedCallback",
  "sticker": {
    "stickerUrl": "https://",
    "mimeType": "image/webp"
  }
}
GIF Return Example #
{
  "isStatusReply":false, 
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone":"554499999999", 
  "waitingMessage":false, 
  "isEdit":false, 
  "isGroup":false, 
  "isNewsletter":false, 
  "instanceId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1632228889000,
  "status":"RECEIVED", 
  "chatName":"name", 
  "senderPhoto":"https://", 
  "senderName":"name", 
  "participantPhone":null, 
  "participantLid":null, 
  "photo":"https://", 
  "broadcast":false, 
  "type":"ReceivedCallback", 
  "video": {
    "videoUrl": "https://",
    "caption": "",
    "mimeType": "video/mp4"
  }
}
Example of payment return made #
{
  "isStatusReply": false,
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1632229683000,
  "status": "RECEIVED",
  "chatName": "name",
  "senderPhoto": "https://",
  "senderName": "name",
  "participantPhone": null,
  "participantLid": null,
  "photo": "https://",
  "broadcast": false,
  "type": "ReceivedCallback",
  "requestPayment": {
    "value": 1,
    "currencyCode": "BRL",
    "expiration": 1632834482000,
    "requestPhone": "5544999999999",
    "paymentInfo": {
      "receiverPhone": "5544999999999",
      "value":1, 
      "currencyCode":"BRL", 
      "status": "WAITING",
      "transactionStatus": "COLLECT_SUCCESS"
    }
  }
}
Example of payment request return #
{
  "isStatusReply":false, 
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone":"554499999999", 
  "waitingMessage":false, 
  "isEdit":false, 
  "isGroup":false, 
  "isNewsletter":false, 
  "instanceId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : true , 
  "momment": 1632230332000,
  "status": "MESSAGE_RECEIVED",
  "chatName":"name", 
  "senderName":"name", 
  "participantPhone": "5544999999999",
  "photo":"https://", 
  "broadcast":false, 
  "type":"ReceivedCallback", 
  "notification": "PAYMENT_ACTION_REQUEST_DECLINED",
  "notificationParameters": ["5544999999999", "BRL", "1000"]
}
Payment Receipt Return Example #
{
  "isStatusReply": false,
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1632230512000,
  "status": "RECEIVED",
  "chatName": "name",
  "senderPhoto": "https://",
  "senderName": "name",
  "participantPhone": null,
  "participantLid": null,
  "photo": "https://",
  "broadcast": false,
  "type": "ReceivedCallback",
  "sendPayment": {
    "paymentInfo": {
      "receiverPhone": "5544999999999",
      "value": 1,
      "currencyCode": "BRL",
      "status": "COMPLETE",
      "transactionStatus": "SUCCESS"
    }
  }
}
Incoming Callback Example #
{
  "isStatusReply":false, 
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone":"554499999999", 
  "waitingMessage":false, 
  "isGroup":false, 
  "isNewsletter":false, 
  "isEdit":false, 
  "instanceId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "messageId": "1679655074-84",
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1679661190000,
  "status":"RECEIVED", 
  "chatName":"name", 
  "senderPhoto":"https://", 
  "senderName":"name", 
  "photo":"https://", 
  "broadcast":false, 
  "referenceMessageId" : null , 
  "externalAdReply": null,
  "forwarded": false,
  "type":"ReceivedCallback", 
  "notification": "CALL_VOICE",
  "notificationParameters": [],
  "callId" : "F44E0E2011E7C784BB9A4AC11749C436" 
}
Missed Callback Example #
{
  "isStatusReply": false,
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "messageId": "1679655074-103",
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1679661194000,
  "status": "RECEIVED",
  "chatName": "name",
  "senderPhoto": "https://",
  "senderName" : "" , 
  "photo": "https://",
  "broadcast": false,
  "referenceMessageId" : null , 
  "externalAdReply": null,
  "forwarded": false,
  "type": "ReceivedCallback",
  "notification": "CALL_MISSED_VOICE",
  "notificationParameters": [],
  "callId" : "F44E0E2011E7C784BB9A4AC11749C436" 
}
Example of requesting to join a group via an invite link #
{
  "isGroup":true, 
  "isNewsletter":false, 
  "instanceId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone": "5544999999999-group",
  "connectedPhone": "5544999999999",
  "fromMe" : false , 
  "momment": 1682017970000,
  "expiresAt": null,
  "status":"RECEIVED", 
  "chatName":"name", 
  "senderPhoto":"https://", 
  "senderName": "name",
  "photo": null,
  "broadcast":false, 
  "participantPhone": "5544999999999",
  "referenceMessageId" : null , 
  "externalAdReply":null, 
  "forwarded":false, 
  "type":"ReceivedCallback", 
  "notification": "MEMBERSHIP_APPROVAL_REQUEST",
  "notificationParameters": [
      "5544999999999"
  ],
  "callId" : null , 
  "code": null,
  "requestMethod": "invite_link"
}
Example of group join request revoked by user #
{
  "isGroup":true, 
  "isNewsletter": false,
  "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone": "5544999999999-group",
  "connectedPhone": "5544999999999",
  "fromMe" : false , 
  "momment": 1682017970000,
  "expiresAt": null,
  "status": "RECEIVED",
  "chatName": "name",
  "senderPhoto": "https://",
  "senderName": "name",
  "photo": null,
  "broadcast": false,
  "participantPhone": "5544999999999",
  "referenceMessageId" : null , 
  "externalAdReply": null,
  "forwarded": false,
  "type": "ReceivedCallback",
  "notification": "REVOKED_MEMBERSHIP_REQUESTS",
  "notificationParameters": [
      "5544999999999"
  ],
  "callId" : null , 
  "code": null
}
Example of a group join request added by a participant #
{
  "isGroup":true, 
  "isNewsletter":false, 
  "instanceId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999-group", 
  "connectedPhone":"5544999999999", 
  "fromMe" : false , 
  "momment":1682017970000, 
  "expiresAt":null, 
  "status":"RECEIVED", 
  "chatName":"name", 
  "senderPhoto":"https://", 
  "senderName":"name", 
  "photo":null, 
  "broadcast":false, 
  "participantPhone":"5544999999999", 
  "referenceMessageId" : null , 
  "externalAdReply":null, 
  "forwarded":false, 
  "type":"ReceivedCallback", 
  "notification": "MEMBERSHIP_APPROVAL_REQUEST",
  "notificationParameters":[ 
      "5544999999999",
      "5544888888888"
  ],
  "callId" : null , 
  "code":null, 
  "requestMethod": "non_admin_add"
}
Example of admin promoted to a channel #
{
  "isStatusReply": false,
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter":false, 
  "instanceId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "messageId": "464201093",
  "phone": "5544999999999@newsletter",
  "fromMe" : false , 
  "momment": 1682017970000,
  "status": "RECEIVED",
  "chatName" : "channel name" , 
  "senderPhoto": null,
  "senderName" : "" , 
  "photo": null,
  "broadcast": false,
  "participantPhone": "5544999999999",
  "referenceMessageId" : null , 
  "externalAdReply": null,
  "forwarded": false,
  "type": "ReceivedCallback",
  "notification": "NEWSLETTER_ADMIN_PROMOTE",
  "notificationParameters": ["5544999999999", "ADMIN"],
  "callId" : null 
}
Example of admin removed from a channel #
{
  "isStatusReply": false,
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "messageId":"464201093", 
  "phone":"5544999999999@newsletter", 
  "fromMe" : false , 
  "momment":1682017970000, 
  "status":"RECEIVED", 
  "chatName" : "channel name" , 
  "senderPhoto":null, 
  "senderName" : "" , 
  "photo":null, 
  "broadcast":false, 
  "participantPhone":"5544999999999", 
  "referenceMessageId" : null , 
  "externalAdReply":null, 
  "forwarded":false, 
  "type":"ReceivedCallback", 
  "notification": "NEWSLETTER_ADMIN_DEMOTE",
  "notificationParameters": ["5544999999999", "SUBSCRIBER"],
  "callId" : null 
}
Product return example #
{
  "isStatusReply":false, 
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone":"554499999999", 
  "waitingMessage":false, 
  "isEdit":false, 
  "isGroup":false, 
  "isNewsletter":false, 
  "instanceId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1632233527000,
  "status":"RECEIVED", 
  "senderPhoto": "https://",
  "senderName" : "5544999999999" , 
  "participantPhone": null,
  "participantLid": null,
  "photo": "https://",
  "broadcast": false,
  "type": "ReceivedCallback",
  "product":{ 
    "productImage": "https://",
    "businessOwnerJid": "5544999999999",
    "currencyCode": "BRL",
    "productId": "99999999999999999999",
    "description": "",
    "productImageCount": 1,
    "price": 1,
    "url": "",
    "retailerId" : "" , 
    "firstImageId": "",
    "title": "name"
  }
}
Cart Return Example #
{
  "isStatusReply": false,
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1632233527000,
  "status": "RECEIVED",
  "chatName": "name",
  "senderPhoto": null,
  "senderName": "name",
  "photo":"https://", 
  "broadcast":false, 
  "forwarded": false,
  "type":"ReceivedCallback", 
  "order":{ 
    "itemCount": 1,
    "orderId" : "422508169684569" , 
    "message": "",
    "orderTitle" : "name" , 
    "sellerID" : "5544999999999" , 
    "thumbnailUrl": "https://",
    "token": "AR5d4yUr+DmSzeCR2kUtPEeMfS+eG0O+S/T/17B+oY1mfA==",
    "currency":"BRL", 
    "total": 2000,
    "subTotal": 2000,
    "products":[ 
      {
        "quantity": 1,
        "name": "nameProduct",
        "productId": "5338924696127051",
        "retailerId" : "1242" , 
        "price": 2000,
        "currencyCode": "BRL"
      }
    ]
  }
}
Poll Return Example #
{
  "isStatusReply": false,
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1632228638000,
  "status": "RECEIVED",
  "chatName": "name",
  "senderPhoto": "https://",
  "senderName": "name",
  "participantPhone": null,
  "participantLid": null,
  "photo": "https://",
  "broadcast": false,
  "type": "ReceivedCallback",
  "poll": {
    "question" : "What is the best WhatsApp API?" , 
    "pollMaxOptions" : 0 , 
    "options":[ 
      {
        "name": "Z-API"
      },
      {
        "name" : "Other" 
      }
    ]
  }
}
Poll Response Return Example #
{
  "isStatusReply":false, 
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone":"554499999999", 
  "waitingMessage":false, 
  "isEdit":false, 
  "isGroup":false, 
  "isNewsletter":false, 
  "instanceId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment":1632228638000, 
  "status":"RECEIVED", 
  "chatName":"name", 
  "senderPhoto":"https://", 
  "senderName":"name", 
  "participantPhone" : "if it is a group this will be the participant who responded" , 
  "photo":"https://", 
  "broadcast":false, 
  "type":"ReceivedCallback", 
  "pollVote" : { 
    "pollMessageId" : "ID of the poll message that was answered" , 
    "options":[ 
      {
        "name": "Z-API"
      }
    ]
  }
}
Example of order shipping return #
{
  "isStatusReply": false,
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment": 1632228925000,
  "status": "RECEIVED",
  "chatName": "name",
  "senderPhoto": "https://",
  "senderName": "name",
  "participantPhone": null,
  "participantLid": null,
  "photo": "https://",
  "broadcast": false,
  "type": "ReceivedCallback",
  "reviewAndPay": {
    "type": "physical-goods",
    "currency":"BRL", 
    "referenceId": "4N9AVI38VOB",
    "orderRequestId": "4N9AVI38VYZ",
    "orderStatus": "pending",
    "paymentStatus":"pending", 
    "total": 605,
    "subTotal": 600,
    "discount":10, 
    "shipping":5, 
    "tax":10, 
    "products":[ 
      {
        "name":"order 1", 
        "quantity":2, 
        "isCustomItem":true, 
        "productId": "custom-item-4N9AVI38WI1",
        "value": 150
      },
      {
        "name":"order 2", 
        "quantity":2, 
        "isCustomItem": false,
        "productId":"23940797548900636", 
        "value":150 
      }
    ]
  }
}
Order Update Callback Example #
{
  "isStatusReply":false, 
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone":"554499999999", 
  "waitingMessage":false, 
  "isEdit":false, 
  "isGroup":false, 
  "isNewsletter":false, 
  "instanceId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment":1632228925000, 
  "status":"RECEIVED", 
  "chatName":"name", 
  "senderPhoto":"https://", 
  "senderName":"name", 
  "participantPhone":null, 
  "participantLid":null, 
  "photo":"https://", 
  "broadcast":false, 
  "type":"ReceivedCallback", 
  "reviewOrder": {
    "currency":"BRL", 
    "referenceId":"4N9AVI38VOB", 
    "orderRequestId":"4N9AVI38VYZ", 
    "orderStatus":"processing", 
    "paymentStatus":"pending", 
    "total":605, 
    "subTotal":600, 
    "discount":10, 
    "shipping":5, 
    "tax":10, 
    "products":[ 
      {
        "name":"order 1", 
        "quantity":2, 
        "isCustomItem":true, 
        "productId":"custom-item-4N9AVI38WI1", 
        "value":150 
      },
      {
        "name":"order 2", 
        "quantity":2, 
        "isCustomItem":false, 
        "productId":"23940797548900636", 
        "value":150 
      }
    ]
  }
}
Example of a channel admin invitation callback #
{
  "isStatusReply":false, 
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone":"554499999999", 
  "waitingMessage":false, 
  "isEdit":false, 
  "isGroup":false, 
  "isNewsletter":false, 
  "instanceId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : false , 
  "momment":1632228925000, 
  "status":"RECEIVED", 
  "chatName":"name", 
  "senderPhoto":"https://", 
  "senderName":"name", 
  "participantPhone":null, 
  "participantLid":null, 
  "photo":"https://", 
  "broadcast":false, 
  "type":"ReceivedCallback", 
  "newsletterAdminInvite": {
    "newsletterId":"120363166555745933@newsletter", 
    "newsletterName" : "Test" , 
    "text" : "I want to invite you to be an admin of my WhatsApp channel." , 
    "inviteExpiration": 1706809668
  }
}
Example of pin message return #
{
  "isStatusReply": false,
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone": "554499999999",
  "waitingMessage": false,
  "isEdit": false,
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "fromMe" : true , 
  "momment": 1632228955000,
  "status": "RECEIVED",
  "chatName": "name",
  "senderPhoto": "https://",
  "senderName": "name",
  "participantPhone": null,
  "participantLid": null,
  "photo": "https://",
  "broadcast": false,
  "type": "ReceivedCallback",
  "pinMessage": {
    "action": "pin",
    "pinDurationInSecs": 604800,
    "referencedMessage": {
      "messageId": "3EB0796DC6B777C0C7CD",
      "fromMe" : true , 
      "phone":"554499999999", 
      "participant": null
    }
  }
}
Event callback example #
{
  "isStatusReply":false, 
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone":"554499999999", 
  "waitingMessage":false, 
  "isEdit":false, 
  "isGroup":true, 
  "isNewsletter":false, 
  "instanceId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"120363019502650977-group", 
  "fromMe" : false , 
  "momment": 1632228638000,
  "status":"RECEIVED", 
  "chatName":"name", 
  "senderPhoto":"https://", 
  "senderName":"name", 
  "participantPhone":null, 
  "participantLid":null, 
  "photo":"https://", 
  "broadcast":false, 
  "type":"ReceivedCallback", 
  "event":{ 
    "name" : "Event Name" , 
    "description" : "Event Description" , 
    "canceled": false,
    "joinLink": "https://call.whatsapp.com/video/v9123XNFG50L6iO79NddXNvKQr6bb3",
    "scheduleTime": 1716915653,
    "location": {}
  }
}
Event Response Return Example #
{
  "isStatusReply":false, 
  "senderLid" : "81896604192873@lid" , 
  "connectedPhone":"554499999999", 
  "waitingMessage":false, 
  "isEdit":false, 
  "isGroup":true, 
  "isNewsletter":false, 
  "instanceId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"120363019502650977-group", 
  "fromMe" : false , 
  "momment":1632228638000, 
  "status":"RECEIVED", 
  "chatName":"name", 
  "senderPhoto":"https://", 
  "senderName":"name", 
  "participantPhone":null, 
  "participantLid":null, 
  "photo":"https://", 
  "broadcast":false, 
  "type":"ReceivedCallback", 
  "eventResponse": {
    "response": "GOING",
    "responseFrom": "554499999999",
    "time": 1714423417000,
    "referencedMessage": {
      "messageId": "D2D612289D9E8F62307D72409A8D9DC3",
      "fromMe" : false , 
      "phone": "120363239161320697-group",
      "participant": "554499999988"
    }
  }
}
Example of "waiting for message" callback #
{
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "messageId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "momment": 1736797729000,
  "status": "RECEIVED",
  "fromMe" : true , 
  "phone":"5544999999999", 
  "chatName" : "chat" , 
  "senderName": "name",
  "senderPhoto": null,
  "photo": null,
  "broadcast": false,
  "participantLid": null,
  "type": "ReceivedCallback",
  "waitingMessage": true,
  "viewOnce": true
}
Example of returning the name change of the connected WhatsApp #
{
  "isGroup":false, 
  "isNewsletter":false, 
  "instanceId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "connectedPhone": "5544999999999",
  "fromMe" : true , 
  "momment":1736797729000, 
  "expiresAt": null,
  "status":"RECEIVED", 
  "chatName" : null , 
  "senderPhoto": "https://",
  "senderName" : "name" , 
  "photo": "https://",
  "broadcast":false, 
  "referenceMessageId" : null , 
  "externalAdReply": null,
  "forwarded": false,
  "type":"ReceivedCallback", 
  "notification": "PROFILE_NAME_UPDATED",
  "callId" : null , 
  "code": null,
  "profileName" : "updated name" 
}
Example of returning a photo change from a connected Whatsapp #
{
  "isGroup": false,
  "isNewsletter": false,
  "instanceId": "A20DA9C0183A2D35A260F53F5D2B9244",
  "phone":"5544999999999", 
  "connectedPhone": "5544999999999",
  "fromMe" : true , 
  "momment": 1736797729000,
  "expiresAt": null,
  "status": "RECEIVED",
  "chatName" : null , 
  "senderPhoto": "https://",
  "senderName" : "name" , 
  "photo": "https://",
  "broadcast": false,
  "referenceMessageId" : null , 
  "externalAdReply": null,
  "forwarded": false,
  "type": "ReceivedCallback",
  "notification": "PROFILE_PICTURE_UPDATED",
  "callId" : null , 
  "code": null,
  "updatedPhoto": "https://"
}
Example of returning a change in labels from a chat #
{
  "isGroup":false, 
  "isNewsletter":false, 
  "instanceId":"A20DA9C0183A2D35A260F53F5D2B9244", 
  "phone":"5544999999999", 
  "connectedPhone":"5544999999999", 
  "fromMe" : true , 
  "momment":1736797729000, 
  "expiresAt":null, 
  "status":"RECEIVED", 
  "chatName" : null , 
  "senderPhoto": null,
  "senderName": "name",
  "photo": null,
  "broadcast":false, 
  "referenceMessageId" : null , 
  "externalAdReply":null, 
  "forwarded":false, 
  "type":"ReceivedCallback", 
  "notification": "CHAT_LABEL_ASSOCIATION",
  "notificationParameters": [
    {
      "phone": "5544977777777",
      "label": "1",
      "assigned": true
    },
    {
      "phone": "5544988888888",
      "label": "2",
      "assigned": false
    }
  ],
  "callId" : null , 
  "code": null
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Notification Response#
Conceptualization #
Notifications are WhatsApp messages that are based on previous WhatsApp message templates.

Put this way, here are documented the notifications we receive, if you do not want to receive these notifications you must ignore the message when it arrives with the notification attribute.

Examples #
case 'MEMBERSHIP_APPROVAL_REQUEST':
campo_html = "<div align='center'><div class='alert alert-primary' role='alert'><span>Participant " + valor2.notificationparameters + " requested to join the group<br><br></span>" + campohora + "</div></div>"
break;
case 'GROUP_PARTICIPANT_LEAVE':
campo_html = "<div align='center'><div class='alert alert-primary' role='alert'><span>Participant " + valor2.notificationparameters + " has left the group!<br><br></span>" + campohora + "</div></div>"
break;
case 'E2E_ENCRYPTED':
// code block
campo_html = "<div align='center'><div class='alert alert-primary' role='alert'><span>Messages are protected with encryption<br><br></span>" + campohora + "</div></div>"
break;
case 'GROUP_CREATE':
campo_html = "<div align='center'><div class='alert alert-primary' role='alert'><span>Created group \'" + valor2.notificationparameters + "\'<br><br></span>" + campohora + "</div></div>"
break;
case 'GROUP_PARTICIPANT_ADD':
campo_html = "<div align='center'><div class='alert alert-primary' role='alert'><span>Participant " + value2.notificationparameters + " added.<br><br></span>" + campohora + "</div></div>"
break;
case "CALL_MISSED_VOICE":
campo_html = "<div align='center'><div class='alert alert-primary' role='alert'><span>Missed voice call!<br><br></span>" + campohora + "</div></div>"
break
case "CALL_MISSED_VIDEO":
campo_html = "<div align='center'><div class='alert alert-primary' role='alert'><span>Missed video call!<br><br></span>" + campohora + "</div></div>"
break;
case 'GROUP_PARTICIPANT_REMOVE':
campo_html = "<div align='center'><div class='alert alert-primary' role='alert'><span>Participant " + valor2.notificationparameters + " has been removed.<br><br></span>" + campohora + "</div></div>"
break;
case "CIPHERTEXT":
campo_html = "<div align='center'><div class='alert alert-primary' role='alert'><span>Messages are protected with state-of-the-art encryption.<br><br></span>" + campohora + "</div></div>"
break;
case "BLUE_MSG_SELF_PREMISE_UNVERIFIED":
campo_html = "<div align='center'><div class='alert alert-primary' role='alert'><span>You are chatting with a business account, but it has not yet been confirmed by WhatsApp.<br><br></span>" + campohora + "</div></div>"
break;
case "BLUE_MSG_SELF_PREMISE_VERIFIED":
campo_html = "<div align='center'><div class='alert alert-primary' role='alert'><span>You are chatting with a WhatsApp verified business account.<br><br></span>" + campohora + "</div></div>"
break;
case "BIZ_MOVE_TO_CONSUMER_APP":
campo_html = "<div align='center'><div class='alert alert-primary' role='alert'><span>This business account is now registered as a personal account and may no longer belong to a company.<br><br></span>" + campohora + "</div></div>"
break;
case "REVOKE":
campo_html = "<div align='center'><div class='alert alert-primary' role='alert'><span>You deleted a message.<br><br></span>" + campohora + "</div></div>"
break;

When disconnecting
Conceptualization #
This is the disconnect response webhook

Attention
Z-API does not accept non-HTTPS webhooks

Updating Webhook #
To update the webhook route, you can do so via the API or the administrative panel.

Tip
You can change all webhooks at once to the same URL. See endpoint .

API#
/update-webhook-disconnected#
PUT https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-webhook-disconnected

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Request Body#
{
  "value": "https://endereco-do-seu-sistema.com.br/instancia/SUA_INSTANCIA/disconnected"
}
Administrative Panel #
img

Returns two webhooks #
The possible returns of the on-whatsapp-disconnected webhook are listed below:

Response#
Attributes	Type	Description
momment	integer	Time when the instance was disconnected from the number.
error	string	Error description.
disconnected	boolean	Indication whether the instance is connected with the number or not.
type	string	Instance event type, in this case it will be "DisconnectedCallback".
200#
{
  "momment": 1580163342,
  "error": "Device has been disconnected",
  "disconnected": true,
  "type": "DisconnectedCallback",
  "instanceId":"instance.id" 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"


Conceptualization #
This is the message status return webhook

Attention
Z-API does not accept non-HTTPS webhooks

Updating Webhook #
To update the webhook route, you can do so via the API or the administrative panel.

Tip
You can change all webhooks at once to the same URL. See endpoint .

API#
/update-webhook-status#
PUT https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-webhook-message-status

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Request Body#
{
  "value": "https://endereco-do-seu-sistema.com.br/instancia/SUA_INSTANCIA/status"
}
Administrative Panel #
img

Returns two webhooks #
The possible returns of the on-whatsapp-message-status-changes webhook are listed below:

Response#
Attributes	Type	Description
status	string	Message status (SENT - if it was sent, RECEIVED - if it was received, READ - if it was read, READ_BY_ME - if it was read by you (number connected to your instance), PLAYED - if it was listened to)
id	string	Message identifier(s).
momment	integer	Time when the instance was disconnected from the number.
phoneDevice	integer	Indicates the device where the event occurred (0 - Cellular)
phone	string	Message destination phone number.
type	string	Instance event type, in this case it will be "MessageStatusCallback".
isGroup	boolean	Indicates whether the chat is a group
200#
{
  "instanceId": "instance.id",
  "status":"SENT", 
  "ids": ["999999999999999999999"],
  "momment": 1632234645000,
  "phoneDevice": 0,
  "phone":"5544999999999", 
  "type": "MessageStatusCallback",
  "isGroup": false
}
{
  "instanceId":"instance.id", 
  "status":"RECEIVED", 
  "ids":["999999999999999999999"], 
  "momment":1632234645000, 
  "phoneDevice":0, 
  "phone":"5544999999999", 
  "type":"MessageStatusCallback", 
  "isGroup":false 
}
{
  "instanceId":"instance.id", 
  "status": "READ",
  "ids":["999999999999999999999"], 
  "momment":1632234645000, 
  "phoneDevice":0, 
  "phone":"5544999999999", 
  "type":"MessageStatusCallback", 
  "isGroup":false 
}
{
  "instanceId":"instance.id", 
  "status": "READ_BY_ME",
  "ids":["999999999999999999999"], 
  "momment":1632234645000, 
  "phoneDevice":0, 
  "phone":"5544999999999", 
  "type":"MessageStatusCallback", 
  "isGroup":false 
}
{
  "instanceId":"instance.id", 
  "status": "PLAYED",
  "ids":["999999999999999999999"], 
  "momment":1632234645000, 
  "phoneDevice":0, 
  "phone":"5544999999999", 
  "type":"MessageStatusCallback", 
  "isGroup":false 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Message status
Conceptualization #
This is the message status return webhook

Attention
Z-API does not accept non-HTTPS webhooks

Updating Webhook #
To update the webhook route, you can do so via the API or the administrative panel.

Tip
You can change all webhooks at once to the same URL. See endpoint .

API#
/update-webhook-status#
PUT https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-webhook-message-status

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Request Body#
{
  "value":"https://endereco-do-seu-sistema.com.br/instancia/SUA_INSTANCIA/status" 
}
Administrative Panel #
img

Returns two webhooks #
The possible returns of the on-whatsapp-message-status-changes webhook are listed below:

Response#
Attributes	Type	Description
status	string	Message status (SENT - if it was sent, RECEIVED - if it was received, READ - if it was read, READ_BY_ME - if it was read by you (number connected to your instance), PLAYED - if it was listened to)
id	string	Message identifier(s).
momment	integer	Time when the instance was disconnected from the number.
phoneDevice	integer	Indicates the device where the event occurred (0 - Cellular)
phone	string	Message destination phone number.
type	string	Instance event type, in this case it will be "MessageStatusCallback".
isGroup	boolean	Indicates whether the chat is a group
200#
{
  "instanceId":"instance.id", 
  "status":"SENT", 
  "ids":["999999999999999999999"], 
  "momment":1632234645000, 
  "phoneDevice":0, 
  "phone":"5544999999999", 
  "type":"MessageStatusCallback", 
  "isGroup":false 
}
{
  "instanceId":"instance.id", 
  "status":"RECEIVED", 
  "ids":["999999999999999999999"], 
  "momment":1632234645000, 
  "phoneDevice":0, 
  "phone":"5544999999999", 
  "type":"MessageStatusCallback", 
  "isGroup":false 
}
{
  "instanceId":"instance.id", 
  "status":"READ", 
  "ids":["999999999999999999999"], 
  "momment":1632234645000, 
  "phoneDevice":0, 
  "phone":"5544999999999", 
  "type":"MessageStatusCallback", 
  "isGroup":false 
}
{
  "instanceId":"instance.id", 
  "status":"READ_BY_ME", 
  "ids":["999999999999999999999"], 
  "momment":1632234645000, 
  "phoneDevice":0, 
  "phone":"5544999999999", 
  "type":"MessageStatusCallback", 
  "isGroup":false 
}
{
  "instanceId":"instance.id", 
  "status":"PLAYED", 
  "ids":["999999999999999999999"], 
  "momment":1632234645000, 
  "phoneDevice":0, 
  "phone":"5544999999999", 
  "type":"MessageStatusCallback", 
  "isGroup":false 
}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Status do chat
Conceptualization #
This is the chat status return webhook

Attention
Z-API does not accept non-HTTPS webhooks

Updating Webhook #
To update the webhook route, you can do so via the API or the administrative panel.

Tip
You can change all webhooks at once to the same URL. See endpoint .

API#
/update-webhook-chat-presence#
PUT https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/update-webhook-chat-presence

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Request Body#
{
  "value":"https://endereco-do-seu-sistema.com.br/instancia/SUA_INSTANCIA/presence" 
}
Administrative Panel #
img

Returns two webhooks #
The possible returns of the on-chat-presence webhook are listed below:

Response#
Attributes	Type	Description
type	string	Instance event type, in this case it will be "PresenceChatCallback".
phone	string	Message destination phone number.
status	string	Identificador do status do chat ex: (Digitando...) status pode conter ( UNAVAILABLE, AVAILABLE, COMPOSING, RECORDING)
lastSeen	timestamp	User's last present identifier.
200#
Outside the chat #
{
  "type":"PresenceChatCallback", 
  "phone":"5544999999999", 
  "status":"UNAVAILABLE", 
  "lastSeen":null, 
  "instanceId":"instance.id" 
}
Inside the chat #
{
  "type":"PresenceChatCallback", 
  "phone":"5544999999999", 
  "status":"AVAILABLE", 
  "lastSeen":null, 
  "instanceId":"instance.id" 
}
Typing in chat #
{
  "type":"PresenceChatCallback", 
  "phone":"5544999999999", 
  "status":"COMPOSING", 
  "lastSeen":null, 
  "instanceId":"instance.id" 
}
Stopped typing or erased what you were typing #
{
  "type":"PresenceChatCallback", 
  "phone":"5544999999999", 
  "status":"PAUSED", 
  "lastSeen":null, 
  "instanceId":"instance.id" 
}
Notice
Observation:

After receiving a composing or recording, a PAUSED will be returned when the event stops.

The PAUSED status is only returned if you are using the multi-device beta.

Recording audio in chat #
{
  "type":"PresenceChatCallback", 
  "phone":"5544999999999", 
  "status":"RECORDING", 
  "lastSeen":null, 
  "instanceId":"instance.id" 
}
Notice
The RECORDING status is only returned if using the multi-device beta.

405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

When connecting
Conceptualization #
This is the return webhook for the Cellphone connection to the Z-api

This webhook is triggered when the Z-API connects to WhatsApp, this can happen when reading the QR code, when restarting the instance, etc.

Attention
Z-API does not accept non-HTTPS webhooks

Updating Webhook #
To update the webhook route, you can do so via the API or the administrative panel.

Tip
You can change all webhooks at once to the same URL. See endpoint .

API#
/update-webhook-connected#
PUT https://api.z-api.io/instances/{id}/token/{token}/update-webhook-connected

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Request Body#
{
  "value":"https://endereco-do-seu-sistema.com.br/instancia/SUA_INSTANCIA/status" 
}
Returns two webhooks #
The possible returns of the on-webhook-connected webhook are listed below:

Response#
Attributes	Type	Description
connected	boolean	instance status.
phone	string	Number connected.
momment	string	Time when the instance was disconnected from the number.
type	string	Instance event type, in this case it will be "ConnectedCallback" .
200#
{

  "type": 'ConnectedCallback',
  "connected": true,
  "momment": 26151515154,
  "instanceId": instance.id,
  "phone" : "number" , , 
  "instanceId":"instance.id" 

}
405#
In this case, make sure that you are sending the method specification correctly, that is, check that you sent the POST or PUT as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Update all webhooks
Conceptualization #
This endpoint is for you if you want to change all webhooks to the same URL at once.

Attention
Z-API does not accept non-HTTPS webhooks

Updating Webhooks #
API#
/update-every-webhooks#
PUT https://api.z-api.io/instances/{id}/token/{token}/update-every-webhooks

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Request Body#
Mandatory #
Attributes	Type	Description
value	string	Endpoint do webhook
Options #
Attributes	Type	Description
notifySentByMe	boolean	Enable webhook for messages received and sent by me
{
  "value": "https://endereco-do-seu-sistema.com.br/instancia/SUA_INSTANCIA/status",
  "notifySentByMe": true
}
Endpoint return #
200#
{
  "value": boolean
}
Update notify sent by me
Conceptualization #
This endpoint allows you to enable the option to receive messages sent by you through the webhook.

Attention
For it to work you must have configured a webhook for the On Receive event .

Updating Wehbook #
API#
/update-notify-sent-by-me#
PUT https://api.z-api.io/instances/{id}/token/{token}/update-notify-sent-by-me

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Request Body#
Mandatory #
Attributes	Type	Description
notifySentByMe	boolean	Enable webhook for messages received and sent by me
{
  "notifySentByMe":true 
}
Endpoint return #
200#
{
    "value": boolean
}

Introduction
Integrating Partner, welcome! #
If you're on this topic, it means you've already cracked some nuts with us, right?

We're delighted that you've considered becoming our integrating partner. We want to be a blessing to your business and hope you continue to prosper, and of course, we're here to help you in this endeavor. Now that you've reached 25 licenses, we know each other well, and our partnership is even stronger. We'll always be available to support you and grow together. You can count on us!

Integrator Model #
By joining the partner program, you'll receive a unique integration token along with the necessary documentation to create, subscribe, or cancel instances via API, eliminating the need to access our admin interface.

Integrating Token #
The token contains a usage limit, but during our partnership this limit undergoes some changes as follows:

First token #
Allows you to create 25 instances

Definitive Token #
After the first 25 instances created with the first token, you will need to request the new definitive token from your group, to be able to create more instances, until infinity. ;)

IMPORTANT #
All responsibility for using the token lies with the customer. Remember that your company is financially responsible for all instances created, so avoid using the token in test mode.
When you create an instance, it defaults to a two-day trial period. After this period, the instance will stop, and our job will delete it. If you want to keep the instance, you need to call the subscription method. It's not necessary to call the cancellation method in this case because the instance is still a trial.
The integrator model is currently postpaid, soon we will have prepaid.
Invoicing #
Our billing cycle works as follows:

All instances subscribed between the 1st and 31st will be grouped together and made available in a single payment due on the 5th of the following month. Example:
Data	Number of instances
01/04	40 instances
01/05	1 new instance
10/05	2 new instances
15/05	5 new instances
20/05	3 new instances
Total on 05/06	51 instances
Canceled instances will remain active for 30 days after the cancellation date, meaning that if you cancel today, you will still be charged on your next invoice and will be available for use until your invoice expires.
Data	Instance invoice
05/06	Invoice with all your instances.
10/06	Canceled 10 instances.
After the cancellation process, the 10 instances were left with the status: Cancelled until 07/10.

This means that when you receive your invoice for month 07, these 10 instances will still be charged.

This process happens because when canceling, it still remains 30 days available for the customer to use.

All instances have an expiration date of the 10th, which will be the maximum period for the service to operate in cases of non-payment. On the 15th, our DevOps will delete all instances from the account.
Migrate instances
During plan subscription, the integrating company may choose to migrate all active instances in the prepaid model to the new postpaid model, however this desire must be expressed at the time of subscription.

How to charge your client
We recommend our clients to use the prepaid model in their solutions as we do not work with pro rata.

Creating an instance
Method #
/on-demand#
POST https://api.z-api.io/instances/integrator/on-demand

Conceptualization #
Method used to create an instance linked to your account.

Tip
You do not necessarily need to subscribe to the instance at this time as you have 2 days to use it as a trial.

Attention
Instance deletion

If you don't subscribe within 2 days, our DevOps team will automatically delete the machine connected to the instance. So, if you don't subscribe, don't worry :)

Attributes #
Mandatory #
Attributes	Type	Description
name	string	Name of the instance to be created
Options #
Attributes	Type	Description
sessionName	string	Attribute to change the session name in WhatsApp (on connected devices)
deliveryCallbackUrl	string	Delivered Message Webhook Endpoint - Delivery
receivedCallbackUrl	string	Incoming Message Webhook Endpoint - receive
receivedAndDeliveryCallbackUrl	string	Endpoint of the webhook for messages received and sent by me - receive
disconnectedCallbackUrl	string	Webhook endpoint disconnected or lost communication - disconnected
connectedCallbackUrl	string	Connection webhook endpoint - connected
messageStatusCallbackUrl	string	EndPoint do webhook de Status
callRejectAuto	boolean	true or false - Automatically reject calls
callRejectMessage	string	Message after automatically rejecting a call
autoReadMessage	boolean	true or false - Automatic reading
isDevice	boolean	Defines whether the instance will be mobile or web
businessDevice	boolean	Choose between the business or standard version of WhatsApp
Request Body#
Method

POST https://api.z-api.io/instances/integrator/on-demand

Example

{
  "name" : "Z-API Instance - 9292812" , 
  "sessionName": "Testes testes",
  "deliveryCallbackUrl": "https://meuwebhook.com.br/delivery",
  "receivedCallbackUrl": "https://meuwebhook.com.br/receive",
  "disconnectedCallbackUrl": "https://meuwebhook.com.br/disconnected",
  "connectedCallbackUrl": "https://meuwebhook.com.br/connected",
  "messageStatusCallbackUrl": "https://meuwebhook.com.br/status",
  "isDevice": false,
  "businessDevice": true
}
Response#
200#
Attributes	Type	Description
id	string	Instance ID created
token	string	TOKEN of the created instance
due	timestamp	Instance expiration date
Example

{
    "id": "8823XWIE982KII99012K2L"
    "token": "8900LS009W0011OOOPPIPIP00912OOLCKAOOOE009919"
    "due": "329000002121"
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/integrator/on-demand");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "authorization: Bearer SEU-TOKEN-AQUI");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"name\": \"Instancia Z-API - 9292812\", \"deliveryCallbackUrl\": \"https://endereco-do-seu-sistema.com.br/instancia/SUA_INSTANCIA/delivery\", \"receivedCallbackUrl\": \"https://endereco-do-seu-sistema.com.br/instancia/SUA_INSTANCIA/receive\", \"disconnectedCallbackUrl\": \"https://endereco-do-seu-sistema.com.br/instancia/SUA_INSTANCIA/disconnected\", \"messageStatusCallbackUrl\": \"https://endereco-do-seu-sistema.com.br/instancia/SUA_INSTANCIA/status\"}");

CURLcode ret = curl_easy_perform(hnd);

Subscribing to an instance
Method #
/subscription#
POST https://api.z-api.io/instances/{id}/token/{token}/integrator/on-demand/subscription

Conceptualization #
Method used to sign an instance.

Attributes #
Mandatory #
Attributes	Type	Description
Options #
Attributes	Type	Description
Request Params#
Method

POST https://api.z-api.io/instances/SUA_INSTANCIA/token/{SEU_TOKEN}/integrator/on-demand/subscription

Response#
201#
OK

405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/%7BSEU_TOKEN%7D/integrator/on-demand/subscription");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "authorization: Bearer SEU-TOKEN-AQUI");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Canceling an instance
Method #
/cancel#
POST https://api.z-api.io/instances/{id}/token/{token}/integrator/on-demand/cancel

Conceptualization #
Method used to cancel an instance.

Attention
From the moment you subscribe to an instance, it will be available for use for 30 days even if you cancel it before this period ends. In other words, if you cancel today, but it expires in 10 days, it will be available for another 30 days until the cancellation is finalized.

Attributes #
Mandatory #
Attributes	Type	Description
Options #
Attributes	Type	Description
Request Params#
Method

POST https://api.z-api.io/instances/{id}/token/{token}/integrator/on-demand/cancel

Response#
201#
OK

405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/%7BSEU_TOKEN%7D/integrator/on-demand/cancel");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "authorization: Bearer SEU-TOKEN-AQUI");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

CURLcode ret = curl_easy_perform(hnd);

Listing instances
Method #
/instances#
GET https://api.z-api.io/instances

Conceptualization #
Method used to list all created instances.

Attributes #
Mandatory #
Attributes	Type	Description
page	integer	Used for pagination, you can enter here the chat page you want to search for.
pageSize	integer	Specifies the size of chat returns per page
Options #
Attributes	Type	Description
query	number	Search by instance name and ID
middleware	string (web, mobile)	Search by instance type: web or mobile. If you don't send this parameter, all instances are returned.
Request Body#
Method

GET https://api.z-api.io/instances?page=1&pageSize=2/

Example

Query params#
key	value	description
query	15	
middleware	web	
pageSize	1	
page	1	
Response#
201#
Attributes	Type	Description
id	string	Instance ID created
token	string	TOKEN of the created instance
due	timestamp	Instance expiration date
Example

{
  "total": 1,
  "totalPage" : 1 , 
  "pageSize": 1,
  "page": 1,
  "content": [
    {
      "token": "",
      "tenant": "",
      "created": "",
      "due": 1648565999675,
      "paymentStatus": "",
      "deliveryCallbackUrl": "",
      "receivedCallbackUrl": "",
      "disconnectedCallbackUrl": "",
      "messageStatusCallbackUrl": "",
      "receivedAndDeliveryCallbackUrl": "",
      "presenceChatCallbackUrl": "",
      "connectedCallbackUrl": "",
      "receivedStatusCallbackUrl": "",
      "phoneConnected": false,
      "whatsappConnected": false,
      "middleware": "web",
      "name":"", 
      "id": ""
    }
  ]
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Webhook Response#
Link to webhook response (upon receipt)

Webhook

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "GET");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "authorization: Bearer SEU-TOKEN-AQUI");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"pageSize\": \"1\", \"page\": \"1\", \"query\": \"8823XWIE982KII99012K2L\", \"middleware\": \"web\"}");

Find My Pack
Introduction #
Logistics control is essential for your e-commerce success. Discover the features Find My Pack offers that will elevate your after-sales service to the highest level.

Tutorial for integrating #
We've provided a video tutorial to help you integrate with Find My Pack.

Introduction
Conceptualization #
This is a difficult topic, lol. Maybe because I've never used the feature, I never saw much value in it. I also don't look at people's statuses much, maybe because I only use WhatsApp for communication. But anyway, the feature is available and everyone can use it as they see fit. If you're like me, you're barely familiar with this feature, it's "lost" in a tab between Conversations and Calls. Below, I'll list some images that explain, according to WhatsApp itself, what the feature is for.

img

img

img

img

Sending status text
Method #
/send-text-status#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-text-status

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
You can post texts in your status and this method is responsible for that, remember that the statuses disappear after 24 hours.

Attributes #
Mandatory #
Attributes	Type	Description
message	String	Message to be sent to your status
Options #
Attributes	Type	Description
Request Body#
URL#
Method

POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-text-status

Body#
{
  "message" : "Your status message" 
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId": "D241XXXX732339502B68"
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
If you receive a 415 error, make sure to add the "Content-Type" of the object you are sending to the request headers, most often "application/json"

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-text-status");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"message\": \"Sua mensagem para status\"}");

CURLcode ret = curl_easy_perform(hnd);

Sending status image
Method #
/send-image-status#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-image-status

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method responsible for sending an image to your status, remember that statuses disappear after 24 hours.

Attributes #
Mandatory #
Attributes	Type	Description
image	String	Image link or its Base64
Options #
Attributes	Type	Description
caption	string	Caption that will go with the image for the status
Request Body#
URL#
Method

POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-image-status

Body#
{
  "image": "https://www.z-api.io/wp-content/themes/z-api/dist/images/logo.svg"
}

{
  "image":"https://www.z-api.io/wp-content/themes/z-api/dist/images/logo.svg", 
  "caption" : "caption text" 
}
Send Base64 image
If you have questions about how to send a Base64 image, access the "Send Image" messages topic, there you will find everything you need to know about sending in this format.

Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-image-status");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"image\": \"https://www.z-api.io/wp-content/themes/z-api/dist/images/logo.svg\"}");

CURLcode ret = curl_easy_perform(hnd);

Reply status with text
Method #
/reply-status-text#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/reply-status-text

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method responsible for sending a text response to a status.

Attributes #
Mandatory #
Attributes	Type	Description
phone	String	Number of the person who sent the status
message	String	Response message
statusMessageId	String	Status message ID. Can be obtained from the received message webhook -> webhook
Request Body#
URL#
Method

POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/reply-status-text

Body#
{
  "phone":"5544999999999", 
  "message" : "message text" , 
  "statusMessageId": "1F606398F2ECAA4846269F659B6003A9"
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/reply-status-text");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\":\"5544999999999\",\"message\":\"texto da mensagem\",\"statusMessageId\":\"1F606398F2ECAA4846269F659B6003A9\"}");

CURLcode ret = curl_easy_perform(hnd);

Responder status com gif
Method #
/reply-status-gif#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/reply-status-gif

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method responsible for sending a response with gif to a status.

Attributes #
Mandatory #
Attributes	Type	Description
phone	String	Number of the person who sent the status
gif	String	Link to your GIF file (The file must be an mp4)
statusMessageId	String	Status message ID. Can be obtained from the received message webhook -> webhook
Request Body#
URL#
Method

POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/reply-status-gif

Body#
{
  "phone":"5544999999999", 
  "gif":"https://file-examples.com/storage/fe88505b6162b2538a045ce/2017/04/file_example_MP4_480_1_5MG.mp4", 
  "statusMessageId":"1F606398F2ECAA4846269F659B6003A9" 
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#

Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/reply-status-gif");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\":\"5544999999999\",\"gif\":\"https://file-examples.com/storage/fe88505b6162b2538a045ce/2017/04/file_example_MP4_480_1_5MG.mp4\",\"statusMessageId\":\"1F606398F2ECAA4846269F659B6003A9\"}");

CURLcode ret = curl_easy_perform(hnd);

Responder status com sticker
Method #
/reply-status-sticker#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/reply-status-sticker

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method responsible for sending a response with a sticker to a status.

Attributes #
Mandatory #
Attributes	Type	Description
phone	String	Number of the person who sent the status
sticker	String	Sticker link or its Base64
statusMessageId	String	Status message ID. Can be obtained from the received message webhook -> webhook
Request Body#
URL#
Method

POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/reply-status-sticker

Body#
{
  "phone":"5544999999999", 
  "sticker":"https://www.z-api.io/wp-content/themes/z-api/dist/images/logo.svg", 
  "statusMessageId":"1F606398F2ECAA4846269F659B6003A9" 
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
id	string	Added for compatibility with Zapier, it has the same value as messageId
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68", 
  "id":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/reply-status-sticker");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"phone\":\"5544999999999\",\"sticker\":\"https://www.z-api.io/wp-content/themes/z-api/dist/sticker/logo.svg\",\"statusMessageId\":\"1F606398F2ECAA4846269F659B6003A9\"}");

CURLcode ret = curl_easy_perform(hnd);

Sending video status
Method #
/send-video-status#
POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-video-status

Header#
Key	Value
Client-Token	ACCOUNT SECURITY TOKEN
Conceptualization #
Method responsible for sending a video to your status, remember that statuses disappear after 24 hours.

caution
The maximum size for videos in status is 10mb

Attributes #
Mandatory #
Attributes	Type	Description
video	String	Video link or its Base64
Options #
Attributes	Type	Description
caption	string	Caption that will go along with the video for the status
Request Body#
URL#
Method

POST https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-video-status

Body#
{
  "video": "https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_480_1_5MG.mp4"
}

{
  "video":"https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_480_1_5MG.mp4", 
  "caption" : "caption text" 
}
Response#
200#
Attributes	Type	Description
zaapId	string	id no z-api
messageId	string	id no whatsapp
Example

{
  "zaapId" : "3999984263738042930CD6ECDE9VDWSA" , 
  "messageId":"D241XXXX732339502B68" 
}
405#
In this case, make sure you are sending the method specification correctly, that is, check if you sent the POST or GET as specified at the beginning of this topic.

415#
Code#

CURL *hnd = curl_easy_init();

curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, "POST");
curl_easy_setopt(hnd, CURLOPT_URL, "https://api.z-api.io/instances/SUA_INSTANCIA/token/SEU_TOKEN/send-video-status");

struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "content-type: application/json");
headers = curl_slist_append(headers, "client-token: {{security-token}}");
curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);

curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, "{\"video\": \"https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_480_1_5MG.mp4\"}");

CURLcode ret = curl_easy_perform(hnd);