# QuickChat - Scalable Realtime Chat Application

![QuickChat Logo](https://placeholder-for-logo.com/logo.png)

## 📌 Overview

QuickChat is a high-performance, scalable chat application built with modern technologies. It supports group chats, direct messaging, real-time typing indicators, online presence, and more. The architecture is designed to handle thousands of concurrent users through a distributed system using Kafka, Redis, and a microservices approach.

## 🏗️ System Architecture

QuickChat uses a modern, scalable architecture:

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────────┐
│  Next.js    │◄────┤  Express.js  │◄────┤  Kafka               │
│  Frontend   │────►│  Backend API │────►│  Message Broker      │
└─────────────┘     └──────────────┘     └──────────────────────┘
                            │                        │
                            ▼                        ▼
                    ┌──────────────┐        ┌──────────────────┐
                    │  PostgreSQL  │        │ Socket.io Server │
                    │  Database    │        │ Real-time Events │
                    └──────────────┘        └──────────────────┘
```

### Key Components:

- **Frontend**: Next.js React application with real-time capabilities
- **Backend API**: Express.js RESTful API for data operations
- **Database**: PostgreSQL with Prisma ORM for data persistence
- **Caching & Presence**: Redis for session management, typing indicators, and online status
- **Message Queue**: Kafka for asynchronous message processing and scalability
- **Websockets**: Real-time communication using Socket.io

## 🚀 Features

- **Authentication**: OAuth integration with Google
- **Group Chats**: Create, join, and manage group conversations
- **Direct Messages**: Private one-on-one conversations
- **Real-time Indicators**: Typing indicators and online presence
- **Message History**: Persistent chat history
- **User Search**: Find and connect with other users
- **Notifications**: Real-time message notifications
- **Scalable Architecture**: Designed for high concurrent user loads

## 📡 API Reference

This section provides detailed documentation for all API endpoints in the QuickChat application. All API requests require authentication unless specified otherwise. Authentication is handled via JWT tokens included in the request header.

### Authentication Header

```
Authorization: Bearer <jwt_token>
```

### Response Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Resource created successfully |
| 400 | Bad request - client error |
| 401 | Unauthorized - authentication required |
| 403 | Forbidden - insufficient permissions |
| 404 | Resource not found |
| 500 | Internal server error |

### Authentication API

#### Login with OAuth

Authenticates a user via OAuth provider credentials.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "name": "John Doe",
    "oauth_id": "google_oauth_id",
    "provider": "google",
    "image": "https://example.com/profile.jpg"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": 123,
      "email": "user@example.com",
      "name": "John Doe",
      "image": "https://example.com/profile.jpg",
      "token": "jwt_auth_token"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid request body
  - `500 Internal Server Error`: Authentication service error

### User Management API

#### Search Users by Email

Search for users by email address.

- **URL**: `/users/search`
- **Method**: `GET`
- **Authentication**: Required
- **Query Parameters**:
  - `email` (required): Partial or complete email to search
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 123,
      "email": "user@example.com",
      "name": "John Doe",
      "image": "https://example.com/profile.jpg"
    },
    {
      "id": 124,
      "email": "user2@example.com",
      "name": "Jane Smith",
      "image": "https://example.com/profile2.jpg"
    }
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid authentication
  - `500 Internal Server Error`: Server-side error

#### Get Current User Profile

Retrieve the profile information of the currently authenticated user.

- **URL**: `/users/profile`
- **Method**: `GET`
- **Authentication**: Required
- **Response (200 OK)**:
  ```json
  {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://example.com/profile.jpg",
    "createdAt": "2023-05-21T13:45:18.000Z",
    "updatedAt": "2023-05-21T13:45:18.000Z"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid authentication
  - `404 Not Found`: User profile not found
  - `500 Internal Server Error`: Server-side error

#### Get Online Users in a Group

Retrieve a list of currently online users in a specific group.

- **URL**: `/users/group/:groupId/online`
- **Method**: `GET`
- **Authentication**: Required
- **URL Parameters**:
  - `groupId` (required): The group ID to check online users
- **Response (200 OK)**:
  ```json
  {
    "onlineUsers": [123, 124, 125]
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid authentication
  - `403 Forbidden`: User is not a member of the group
  - `404 Not Found`: Group not found
  - `500 Internal Server Error`: Server-side error

### Group Chat Management API

#### Create a New Group Chat

Create a new group chat with the authenticated user as the owner.

- **URL**: `/groups`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "name": "Project Team Discussion",
    "description": "Group chat for the development team"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": "group-uuid-1234",
    "name": "Project Team Discussion",
    "description": "Group chat for the development team",
    "shareLink": "unique-share-link-123",
    "isGroup": true,
    "createdAt": "2023-05-21T13:45:18.000Z",
    "updatedAt": "2023-05-21T13:45:18.000Z",
    "members": [
      {
        "id": 123,
        "email": "user@example.com",
        "name": "John Doe",
        "isOwner": true
      }
    ]
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid request body
  - `401 Unauthorized`: Missing or invalid authentication
  - `500 Internal Server Error`: Server-side error

#### Get User's Group Chats

Retrieve all group chats the authenticated user is a member of.

- **URL**: `/groups`
- **Method**: `GET`
- **Authentication**: Required
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "group-uuid-1234",
      "name": "Project Team Discussion",
      "description": "Group chat for the development team",
      "shareLink": "unique-share-link-123",
      "isGroup": true,
      "createdAt": "2023-05-21T13:45:18.000Z",
      "updatedAt": "2023-05-21T13:45:18.000Z",
      "unreadCount": 5,
      "lastMessage": {
        "id": "msg-uuid-1234",
        "content": "Latest message content",
        "senderId": 124,
        "senderName": "Jane Smith",
        "createdAt": "2023-05-21T14:45:18.000Z"
      }
    },
    {
      "id": "group-uuid-5678",
      "name": "Coffee Chat",
      "description": "General discussions",
      "shareLink": "unique-share-link-456",
      "isGroup": true,
      "createdAt": "2023-05-20T10:45:18.000Z",
      "updatedAt": "2023-05-21T11:45:18.000Z",
      "unreadCount": 0,
      "lastMessage": {
        "id": "msg-uuid-5678",
        "content": "Latest message in coffee chat",
        "senderId": 123,
        "senderName": "John Doe",
        "createdAt": "2023-05-21T11:45:18.000Z"
      }
    }
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid authentication
  - `500 Internal Server Error`: Server-side error

#### Get Group Details

Retrieve detailed information about a specific group chat.

- **URL**: `/groups/:groupId`
- **Method**: `GET`
- **Authentication**: Required
- **URL Parameters**:
  - `groupId` (required): The group ID to retrieve
- **Response (200 OK)**:
  ```json
  {
    "id": "group-uuid-1234",
    "name": "Project Team Discussion",
    "description": "Group chat for the development team",
    "shareLink": "unique-share-link-123",
    "isGroup": true,
    "createdAt": "2023-05-21T13:45:18.000Z",
    "updatedAt": "2023-05-21T13:45:18.000Z",
    "members": [
      {
        "id": 123,
        "email": "user@example.com",
        "name": "John Doe",
        "image": "https://example.com/profile.jpg",
        "isOwner": true,
        "isOnline": true,
        "joinedAt": "2023-05-21T13:45:18.000Z"
      },
      {
        "id": 124,
        "email": "user2@example.com",
        "name": "Jane Smith",
        "image": "https://example.com/profile2.jpg",
        "isOwner": false,
        "isOnline": false,
        "joinedAt": "2023-05-21T13:50:18.000Z"
      }
    ],
    "messages": [
      {
        "id": "msg-uuid-1234",
        "content": "Hello everyone!",
        "senderId": 123,
        "senderName": "John Doe",
        "createdAt": "2023-05-21T13:46:18.000Z"
      },
      {
        "id": "msg-uuid-5678",
        "content": "Hi John!",
        "senderId": 124,
        "senderName": "Jane Smith",
        "createdAt": "2023-05-21T13:47:18.000Z"
      }
    ]
  }
  ```
- **Query Parameters**:
  - `limit` (optional): Number of messages to retrieve (default: 50)
  - `before` (optional): Timestamp to retrieve messages before
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid authentication
  - `403 Forbidden`: User is not a member of the group
  - `404 Not Found`: Group not found
  - `500 Internal Server Error`: Server-side error

#### Add Member to Group

Add a new member to an existing group chat.

- **URL**: `/groups/:groupId/members`
- **Method**: `POST`
- **Authentication**: Required
- **URL Parameters**:
  - `groupId` (required): The group ID to add member to
- **Request Body**:
  ```json
  {
    "userId": 125
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "User added to group successfully",
    "member": {
      "id": 125,
      "email": "newuser@example.com",
      "name": "New User",
      "image": "https://example.com/profile3.jpg",
      "isOwner": false,
      "joinedAt": "2023-05-21T14:45:18.000Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid user ID
  - `401 Unauthorized`: Missing or invalid authentication
  - `403 Forbidden`: User is not an owner/admin of the group
  - `404 Not Found`: Group or user not found
  - `409 Conflict`: User is already a member of the group
  - `500 Internal Server Error`: Server-side error

#### Remove Member from Group

Remove a member from a group chat.

- **URL**: `/groups/:groupId/members/:memberId`
- **Method**: `DELETE`
- **Authentication**: Required
- **URL Parameters**:
  - `groupId` (required): The group ID
  - `memberId` (required): The user ID to remove from the group
- **Response (200 OK)**:
  ```json
  {
    "message": "User removed from group successfully"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid authentication
  - `403 Forbidden`: User is not an owner/admin of the group or trying to remove the owner
  - `404 Not Found`: Group or member not found
  - `500 Internal Server Error`: Server-side error

#### Join Group via Shared Link

Join a group chat using a unique share link.

- **URL**: `/groups/join/:shareLink`
- **Method**: `GET`
- **Authentication**: Required
- **URL Parameters**:
  - `shareLink` (required): The unique share link for the group
- **Response (200 OK)**:
  ```json
  {
    "message": "Joined group successfully",
    "group": {
      "id": "group-uuid-1234",
      "name": "Project Team Discussion",
      "description": "Group chat for the development team",
      "shareLink": "unique-share-link-123",
      "isGroup": true,
      "createdAt": "2023-05-21T13:45:18.000Z",
      "updatedAt": "2023-05-21T13:45:18.000Z"
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid authentication
  - `404 Not Found`: Invalid share link or group not found
  - `409 Conflict`: User is already a member of the group
  - `500 Internal Server Error`: Server-side error

#### Delete a Group

Delete a group chat (owner only).

- **URL**: `/groups/:groupId`
- **Method**: `DELETE`
- **Authentication**: Required
- **URL Parameters**:
  - `groupId` (required): The group ID to delete
- **Response (200 OK)**:
  ```json
  {
    "message": "Group deleted successfully"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid authentication
  - `403 Forbidden`: User is not the owner of the group
  - `404 Not Found`: Group not found
  - `500 Internal Server Error`: Server-side error

### Direct Chat Management API

#### Create/Access Direct Chat

Create a new direct chat or access an existing one between two users.

- **URL**: `/direct-chats`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "receiverId": 124
  }
  ```
- **Response (200 OK or 201 Created)**:
  ```json
  {
    "id": "direct-chat-uuid-1234",
    "senderId": 123,
    "receiverId": 124,
    "createdAt": "2023-05-21T13:45:18.000Z",
    "receiver": {
      "id": 124,
      "name": "Jane Smith",
      "email": "user2@example.com",
      "image": "https://example.com/profile2.jpg"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid receiver ID
  - `401 Unauthorized`: Missing or invalid authentication
  - `404 Not Found`: Receiver user not found
  - `500 Internal Server Error`: Server-side error

#### Get User's Direct Chats

Retrieve all direct chats for the authenticated user.

- **URL**: `/direct-chats`
- **Method**: `GET`
- **Authentication**: Required
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "direct-chat-uuid-1234",
      "senderId": 123,
      "receiverId": 124,
      "createdAt": "2023-05-21T13:45:18.000Z",
      "updatedAt": "2023-05-21T13:45:18.000Z",
      "user": {
        "id": 124,
        "name": "Jane Smith",
        "email": "user2@example.com",
        "image": "https://example.com/profile2.jpg",
        "isOnline": true
      },
      "unreadCount": 3,
      "lastMessage": {
        "id": "msg-uuid-1234",
        "content": "Let's meet tomorrow",
        "senderId": 124,
        "createdAt": "2023-05-21T14:45:18.000Z"
      }
    },
    {
      "id": "direct-chat-uuid-5678",
      "senderId": 123,
      "receiverId": 125,
      "createdAt": "2023-05-20T10:45:18.000Z",
      "updatedAt": "2023-05-21T11:45:18.000Z",
      "user": {
        "id": 125,
        "name": "New User",
        "email": "newuser@example.com",
        "image": "https://example.com/profile3.jpg",
        "isOnline": false
      },
      "unreadCount": 0,
      "lastMessage": {
        "id": "msg-uuid-5678",
        "content": "Thanks for the information",
        "senderId": 123,
        "createdAt": "2023-05-21T11:45:18.000Z"
      }
    }
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid authentication
  - `500 Internal Server Error`: Server-side error

#### Get Direct Chat Messages

Retrieve messages for a specific direct chat.

- **URL**: `/direct-chats/:chatId/messages`
- **Method**: `GET`
- **Authentication**: Required
- **URL Parameters**:
  - `chatId` (required): The direct chat ID
- **Query Parameters**:
  - `limit` (optional): Number of messages to retrieve (default: 50)
  - `before` (optional): Timestamp to retrieve messages before
- **Response (200 OK)**:
  ```json
  {
    "messages": [
      {
        "id": "msg-uuid-1234",
        "content": "Hey, how are you?",
        "senderId": 123,
        "createdAt": "2023-05-21T13:45:18.000Z",
        "readAt": "2023-05-21T13:46:18.000Z"
      },
      {
        "id": "msg-uuid-5678",
        "content": "I'm good, thanks! How about you?",
        "senderId": 124,
        "createdAt": "2023-05-21T13:47:18.000Z",
        "readAt": null
      }
    ],
    "hasMore": false
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid authentication
  - `403 Forbidden`: User is not a participant in the direct chat
  - `404 Not Found`: Direct chat not found
  - `500 Internal Server Error`: Server-side error

### Message Management API

#### Send Message

Send a new message to either a group or direct chat.

- **URL**: `/messages`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "chatId": "group-uuid-1234", // or direct-chat-uuid-1234
    "content": "Hello everyone!",
    "type": "text" // can be "text", "image", "file", etc.
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": "msg-uuid-9876",
    "content": "Hello everyone!",
    "type": "text",
    "sender": {
      "id": 123,
      "name": "John Doe",
      "image": "https://example.com/profile.jpg"
    },
    "groupId": "group-uuid-1234", // if sent to a group
    "directChatId": null,         // if sent to a direct chat, this would have a value
    "createdAt": "2023-05-21T15:45:18.000Z"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid request body or message type
  - `401 Unauthorized`: Missing or invalid authentication
  - `403 Forbidden`: User does not have permission to send message to this chat
  - `404 Not Found`: Chat not found
  - `500 Internal Server Error`: Server-side error

#### Get Group Messages

Retrieve messages for a specific group.

- **URL**: `/messages/group/:groupId`
- **Method**: `GET`
- **Authentication**: Required
- **URL Parameters**:
  - `groupId` (required): The group ID
- **Query Parameters**:
  - `limit` (optional): Number of messages to retrieve (default: 50)
  - `before` (optional): Timestamp to retrieve messages before (ISO format)
  - `includeSystem` (optional): Whether to include system messages (default: true)
- **Response (200 OK)**:
  ```json
  {
    "messages": [
      {
        "id": "msg-uuid-1234",
        "content": "Hello everyone!",
        "type": "text",
        "sender": {
          "id": 123,
          "name": "John Doe",
          "image": "https://example.com/profile.jpg"
        },
        "createdAt": "2023-05-21T13:45:18.000Z"
      },
      {
        "id": "msg-uuid-5678",
        "content": "Hi John!",
        "type": "text",
        "sender": {
          "id": 124,
          "name": "Jane Smith",
          "image": "https://example.com/profile2.jpg"
        },
        "createdAt": "2023-05-21T13:47:18.000Z"
      },
      {
        "id": "msg-uuid-9012",
        "content": "Jane Smith joined the group",
        "type": "system",
        "createdAt": "2023-05-21T13:40:18.000Z"
      }
    ],
    "hasMore": true,
    "oldestMessageId": "msg-uuid-9012"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid authentication
  - `403 Forbidden`: User is not a member of the group
  - `404 Not Found`: Group not found
  - `500 Internal Server Error`: Server-side error

#### Mark Messages as Read

Mark all messages in a chat as read up to the current time.

- **URL**: `/messages/read`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "chatId": "direct-chat-uuid-1234", // or group-uuid-1234
    "isGroup": false // true if marking messages in a group chat
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Messages marked as read",
    "updatedCount": 5
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid chatId or isGroup parameter
  - `401 Unauthorized`: Missing or invalid authentication
  - `403 Forbidden`: User does not have access to this chat
  - `404 Not Found`: Chat not found
  - `500 Internal Server Error`: Server-side error

#### Upload File or Image

Upload a file or image to be sent in a message.

- **URL**: `/messages/upload`
- **Method**: `POST`
- **Authentication**: Required
- **Content Type**: `multipart/form-data`
- **Request Parameters**:
  - `file` (required): The file to upload
  - `chatId` (required): ID of the chat where the file will be sent
  - `type` (required): Type of upload ("image" or "file")
- **Response (200 OK)**:
  ```json
  {
    "url": "https://storage.example.com/uploads/file-uuid-1234.jpg",
    "filename": "vacation-photo.jpg",
    "size": 1024576,
    "mimetype": "image/jpeg"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid file or parameters
  - `401 Unauthorized`: Missing or invalid authentication
  - `403 Forbidden`: User does not have permission to upload to this chat
  - `413 Payload Too Large`: File exceeds maximum size limit
  - `500 Internal Server Error`: Server-side error

#### Delete Message

Delete a message sent by the user.

- **URL**: `/messages/:messageId`
- **Method**: `DELETE`
- **Authentication**: Required
- **URL Parameters**:
  - `messageId` (required): The ID of the message to delete
- **Response (200 OK)**:
  ```json
  {
    "message": "Message deleted successfully"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid authentication
  - `403 Forbidden`: User is not the sender of the message
  - `404 Not Found`: Message not found
  - `410 Gone`: Message is too old to be deleted (if time restriction exists)
  - `500 Internal Server Error`: Server-side error

## 📊 Database Schema

QuickChat uses PostgreSQL with Prisma ORM to manage its data. Below is the detailed database schema design:

### Core Tables

#### Users Table

Stores user information and authentication details.

```
+----------------+---------------+------+-----+-------------------+
| Column         | Type          | Null | Key | Default/Extra     |
+----------------+---------------+------+-----+-------------------+
| id             | INTEGER       | NO   | PK  | AUTO_INCREMENT    |
| email          | VARCHAR(255)  | NO   | UK  |                   |
| name           | VARCHAR(255)  | NO   |     |                   |
| image          | VARCHAR(1000) | YES  |     | NULL              |
| oauth_id       | VARCHAR(255)  | NO   | UK  |                   |
| provider       | VARCHAR(50)   | NO   |     |                   |
| created_at     | TIMESTAMP     | NO   |     | CURRENT_TIMESTAMP |
| updated_at     | TIMESTAMP     | NO   |     | CURRENT_TIMESTAMP |
+----------------+---------------+------+-----+-------------------+
```

#### Chat Groups Table

Stores information about chat groups and direct chat pairs.

```
+----------------+---------------+------+-----+-------------------+
| Column         | Type          | Null | Key | Default/Extra     |
+----------------+---------------+------+-----+-------------------+
| id             | UUID          | NO   | PK  |                   |
| name           | VARCHAR(255)  | YES  |     | NULL              |
| description    | TEXT          | YES  |     | NULL              |
| is_group       | BOOLEAN       | NO   |     | TRUE              |
| share_link     | VARCHAR(255)  | YES  | UK  | NULL              |
| created_at     | TIMESTAMP     | NO   |     | CURRENT_TIMESTAMP |
| updated_at     | TIMESTAMP     | NO   |     | CURRENT_TIMESTAMP |
+----------------+---------------+------+-----+-------------------+
```

#### Group Users Table

Junction table that maps users to chat groups and defines their role in the group.

```
+----------------+---------------+------+-----+-------------------+
| Column         | Type          | Null | Key | Default/Extra     |
+----------------+---------------+------+-----+-------------------+
| id             | INTEGER       | NO   | PK  | AUTO_INCREMENT    |
| group_id       | UUID          | NO   | FK  |                   |
| user_id        | INTEGER       | NO   | FK  |                   |
| is_owner       | BOOLEAN       | NO   |     | FALSE             |
| created_at     | TIMESTAMP     | NO   |     | CURRENT_TIMESTAMP |
| updated_at     | TIMESTAMP     | NO   |     | CURRENT_TIMESTAMP |
+----------------+---------------+------+-----+-------------------+
```

#### Direct Chats Table

Stores information about one-to-one chat conversations.

```
+----------------+---------------+------+-----+-------------------+
| Column         | Type          | Null | Key | Default/Extra     |
+----------------+---------------+------+-----+-------------------+
| id             | UUID          | NO   | PK  |                   |
| sender_id      | INTEGER       | NO   | FK  |                   |
| receiver_id    | INTEGER       | NO   | FK  |                   |
| created_at     | TIMESTAMP     | NO   |     | CURRENT_TIMESTAMP |
+----------------+---------------+------+-----+-------------------+
Unique Constraint: (sender_id, receiver_id)
```

#### Chats Table

Stores all chat messages for both group and direct chats.

```
+----------------+---------------+------+-----+-------------------+
| Column         | Type          | Null | Key | Default/Extra     |
+----------------+---------------+------+-----+-------------------+
| id             | UUID          | NO   | PK  |                   |
| content        | TEXT          | NO   |     |                   |
| type           | VARCHAR(20)   | NO   |     | 'text'            |
| sender_id      | INTEGER       | NO   | FK  |                   |
| group_id       | UUID          | YES  | FK  | NULL              |
| direct_chat_id | UUID          | YES  | FK  | NULL              |
| created_at     | TIMESTAMP     | NO   |     | CURRENT_TIMESTAMP |
| read_at        | TIMESTAMP     | YES  |     | NULL              |
+----------------+---------------+------+-----+-------------------+
```

### Entity Relationships

The following diagram illustrates the relationships between the main entities:

```
┌──────────┐           ┌────────────┐           ┌───────────┐
│  Users   │◄─────┐    │ ChatGroups │    ┌─────►│DirectChats│
├──────────┤      └───►├────────────┤◄───┘      ├───────────┤
│id        │           │id          │           │id         │
│email     │           │name        │           │sender_id  │──┐
│name      │◄──┐       │description │           │receiver_id│──┼───┐
│image     │   │       │is_group    │           └───────────┘  │   │
│oauth_id  │   │       │share_link  │                          │   │
└──────────┘   │       └────────────┘                          │   │
               │              ▲                                │   │
               │              │                                │   │
               │        ┌─────┴──────┐                         │   │
               │        │ GroupUsers │                         │   │
               └────────┼────────────┼─────────────────────────┘   │
                        │id          │                             │
                        │group_id    │                             │
                        │user_id     │                             │
                        │is_owner    │                             │
                        └────────────┘                             │
                              ▲                                    │
                              │                                    │
                        ┌─────┴──────┐                             │
                        │   Chats    │                             │
                        ├────────────┤                             │
                        │id          │                             │
                        │content     │                             │
                        │type        │                             │
                        │sender_id   │─────────────────────────────┘
                        │group_id    │
                        │direct_chat_│
                        │read_at     │
                        └────────────┘
```

### Key Relationships

1. **User to ChatGroups (Many-to-Many)**:
   - A user can be part of multiple chat groups
   - A chat group can have multiple users
   - The GroupUsers table manages this relationship and tracks ownership

2. **User to DirectChats (One-to-Many)**:
   - A user can initiate multiple direct chats (as sender)
   - A user can receive multiple direct chats (as receiver)
   - Each direct chat connects exactly two users

3. **Chats to ChatGroups/DirectChats (Many-to-One)**:
   - Each chat message belongs to either a group chat or a direct chat (but not both)
   - A group/direct chat can have multiple messages

4. **User to Chats (One-to-Many)**:
   - A user can send multiple chat messages
   - Each chat message is sent by exactly one user

### Indexing Strategy

The following indexes are created to optimize query performance:

1. **Primary Keys**: All tables have primary keys for unique row identification
2. **Foreign Keys**: Established for all relationships with appropriate cascading rules
3. **Unique Constraints**: 
   - Email and OAuth ID in users table
   - Share link in chat_groups table
   - Sender/receiver pair in direct_chats table
4. **Performance Indexes**:
   - Index on `group_id` and `user_id` in group_users table
   - Index on `sender_id` and `group_id`/`direct_chat_id` in chats table
   - Index on `created_at` in chats table for pagination queries

## 🔒 Security Implementation

QuickChat implements comprehensive security measures to protect user data and communications:

### Authentication & Authorization

#### OAuth 2.0 Integration
- Google OAuth provider integration for secure authentication
- JWT (JSON Web Token) implementation for stateless authentication
- Token expiration and rotation for enhanced security

```javascript
// JWT Generation for authenticated users
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};
```

#### Role-Based Access Control
- Group owners have full administrative rights
- Group members have standard participation permissions
- Non-members cannot access private group data
- Permission validation middleware for all sensitive operations

```javascript
// Example middleware for owner-only operations
const isGroupOwner = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    
    const membership = await prisma.groupUsers.findFirst({
      where: {
        groupId,
        userId,
        isOwner: true
      }
    });
    
    if (!membership) {
      return res.status(403).json({ error: "Only group owners can perform this action" });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
```

### Data Protection

#### Encryption
- HTTPS/TLS for all client-server communications
- Secure WebSocket connections (WSS)
- Sensitive data encryption at rest

#### Input Validation & Sanitization
- Request body validation using schemas
- Protection against injection attacks
- Content security policies

```javascript
// Example validation middleware
const validateMessageInput = (req, res, next) => {
  const { content, type } = req.body;
  
  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: "Message content cannot be empty" });
  }
  
  if (content.length > 4000) {
    return res.status(400).json({ error: "Message exceeds maximum length" });
  }
  
  if (type && !['text', 'image', 'file'].includes(type)) {
    return res.status(400).json({ error: "Invalid message type" });
  }
  
  // Sanitize content to prevent XSS
  req.body.content = sanitizeHtml(content);
  
  next();
};
```

### Rate Limiting & Abuse Prevention

- API rate limiting to prevent abuse
- Connection throttling for WebSockets
- CAPTCHA for sensitive operations

```javascript
// Rate limiting middleware configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" }
};

app.use('/api/', rateLimit(rateLimitConfig));
```

### Auditing & Monitoring

- Comprehensive event logging
- Failed authentication attempt monitoring
- Suspicious activity detection
- Regular security audits

```javascript
// Security event logging
const logSecurityEvent = async (userId, eventType, details) => {
  await prisma.securityLog.create({
    data: {
      userId,
      eventType,
      details,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    }
  });
};
```

### Data Privacy Compliance

- GDPR compliance features
- Data export functionality
- Account deletion with complete data removal
- Cookie consent mechanisms
- Clear privacy policies

## �� Real-time Events

### WebSocket Architecture

QuickChat implements a robust real-time communication system using Socket.io with Redis adapter for horizontal scaling. This architecture ensures that events are correctly propagated across multiple server instances when deployed in a clustered environment.

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────────┐
│  Client     │◄────┤  Socket.io   │◄────┤  Redis Pub/Sub       │
│  Browser    │────►│  Server      │────►│  Adapter             │
└─────────────┘     └──────────────┘     └──────────────────────┘
                            │                        │
                            ▼                        ▼
                    ┌──────────────┐        ┌──────────────────┐
                    │  User        │        │ Message Queue    │
                    │  Presence    │        │ Kafka            │
                    └──────────────┘        └──────────────────┘
```

### Connection Lifecycle

1. **Connection**: Client connects with JWT authentication
2. **Room Management**: Client joins rooms for their chats
3. **Presence Tracking**: Online status is broadcast to relevant users
4. **Message Exchange**: Real-time messages are sent and received 
5. **Typing Indicators**: User typing status is broadcast to chat participants
6. **Disconnect Handling**: Clean-up on client disconnect

### Socket.io Events

| Event | Direction | Description | Payload | Response |
|-------|-----------|-------------|---------|----------|
| `connect` | Client → Server | User connects to socket | Authentication token | Connection acknowledgment |
| `disconnect` | Client → Server | User disconnects | - | Offline status broadcast |
| `join-room` | Client → Server | Join a chat room | `{ roomId }` | Room join confirmation |
| `leave-room` | Client → Server | Leave a chat room | `{ roomId }` | Room leave confirmation |
| `typing` | Client → Server | User is typing | `{ chatId, isTyping }` | Typing status broadcast |
| `chat-message` | Client → Server | Send a new message | `{ chatId, content, type }` | Message broadcast |
| `read-receipt` | Client → Server | Mark messages as read | `{ chatId, timestamp }` | Read receipt confirmation |
| `user-online` | Server → Client | User comes online | `{ userId, timestamp }` | - |
| `user-offline` | Server → Client | User goes offline | `{ userId, lastActive }` | - |
| `typing-update` | Server → Client | Typing status update | `{ chatId, typingUsers }` | - |
| `new-message` | Server → Client | New message received | Message object | - |
| `message-delivered` | Server → Client | Message delivered to recipient | `{ messageId, deliveredAt }` | - |
| `message-read` | Server → Client | Message read by recipient | `{ messageId, readAt, userId }` | - |

### Detailed Socket Event Specifications

#### Authentication and Connection

**Client to Server: Connect**
```javascript
// Client-side code
const socket = io(SOCKET_URL, {
  auth: { token: 'your-jwt-token' },
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

socket.on('connect', () => {
  console.log('Connected to socket server with ID:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
  // Handle authentication errors or server unavailability
});
```

**Server Authentication Handling**
```javascript
// Server-side code
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (error) {
    return next(new Error('Authentication error'));
  }
});
```

**Client to Server: Disconnect**
```javascript
// Client-side code
// Graceful disconnect with reason
socket.disconnect();

// Server-side handling
io.on('connection', (socket) => {
  socket.on('disconnect', (reason) => {
    console.log(`User ${socket.userId} disconnected. Reason: ${reason}`);
    // Clean up user's online status and room memberships
  });
});
```

#### Chat Room Management

**Client to Server: Join Room**
```javascript
// Client-side code
socket.emit('join-room', { roomId: 'group-uuid-1234' }, (response) => {
  if (response.success) {
    console.log('Joined room successfully');
  } else {
    console.error('Failed to join room:', response.error);
  }
});

// Server-side handling
socket.on('join-room', async (data, callback) => {
  try {
    // Verify user has permission to join this room
    const canJoin = await checkRoomAccess(socket.userId, data.roomId);
    
    if (canJoin) {
      await socket.join(data.roomId);
      // Store in Redis that this user is in this room
      await RedisService.addUserToRoom(socket.userId, data.roomId);
      callback({ success: true });
    } else {
      callback({ success: false, error: 'Access denied' });
    }
  } catch (error) {
    callback({ success: false, error: 'Server error' });
  }
});
```

**Client to Server: Leave Room**
```javascript
// Client-side code
socket.emit('leave-room', { roomId: 'group-uuid-1234' });

// Server-side handling
socket.on('leave-room', async (data) => {
  await socket.leave(data.roomId);
  await RedisService.removeUserFromRoom(socket.userId, data.roomId);
});
```

#### Typing Indicators

**Client to Server: User Typing**
```javascript
// Client-side code
// Implement debounce for better UX
let typingTimeout;

function sendTypingIndicator(chatId, isTyping) {
  socket.emit('typing', { chatId, isTyping });
}

function handleKeyPress(chatId) {
  // Clear existing timeout
  clearTimeout(typingTimeout);
  
  // Send typing indicator
  sendTypingIndicator(chatId, true);
  
  // Set timeout to stop typing indicator after 2 seconds of inactivity
  typingTimeout = setTimeout(() => {
    sendTypingIndicator(chatId, false);
  }, 2000);
}

// Example usage
messageInput.addEventListener('keydown', () => handleKeyPress('group-uuid-1234'));
```

**Server to Client: Typing Update**
```javascript
// Client-side code
socket.on('typing-update', (data) => {
  const { chatId, typingUsers } = data;
  
  // typingUsers contains user objects with id, name
  if (typingUsers.length === 0) {
    setTypingIndicator(chatId, null);
  } else if (typingUsers.length === 1) {
    setTypingIndicator(chatId, `${typingUsers[0].name} is typing...`);
  } else if (typingUsers.length === 2) {
    setTypingIndicator(chatId, `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`);
  } else {
    setTypingIndicator(chatId, `${typingUsers.length} people are typing...`);
  }
});

// Server-side handling
socket.on('typing', async (data) => {
  const { chatId, isTyping } = data;
  
  if (isTyping) {
    await RedisService.setUserTyping(chatId, socket.userId);
  } else {
    await RedisService.removeUserTyping(chatId, socket.userId);
  }
  
  // Get all typing users for this chat
  const typingUserIds = await RedisService.getTypingUsers(chatId);
  
  // Get user details for each typing user
  const typingUsers = await getUserDetails(typingUserIds);
  
  // Broadcast to all users in this chat room
  io.to(chatId).emit('typing-update', { chatId, typingUsers });
});
```

#### Messaging

**Client to Server: Send Message**
```javascript
// Client-side code
function sendMessage(chatId, content, type = 'text') {
  return new Promise((resolve, reject) => {
    socket.emit('chat-message', {
      chatId,
      content,
      type
    }, (response) => {
      if (response.success) {
        resolve(response.message);
      } else {
        reject(new Error(response.error));
      }
    });
  });
}

// Example usage
sendMessage('group-uuid-1234', 'Hello everyone!')
  .then(message => {
    console.log('Message sent:', message);
    // Update UI with the new message
    appendMessage(message);
  })
  .catch(error => {
    console.error('Failed to send message:', error);
    // Show error to user
  });
```

**Server to Client: New Message**
```javascript
// Server-side handling of new messages
socket.on('chat-message', async (data, callback) => {
  try {
    const { chatId, content, type } = data;
    
    // Check if user can send message to this chat
    const canSend = await checkChatAccess(socket.userId, chatId);
    
    if (!canSend) {
      return callback({ success: false, error: 'Access denied' });
    }
    
    // Create message in database
    const message = await createMessage({
      senderId: socket.userId,
      chatId,
      content,
      type
    });
    
    // Get sender details
    const sender = await getUserById(socket.userId);
    
    // Create the full message object
    const fullMessage = {
      id: message.id,
      content: message.content,
      type: message.type,
      sender: {
        id: sender.id,
        name: sender.name,
        image: sender.image
      },
      groupId: message.groupId,
      directChatId: message.directChatId,
      createdAt: message.createdAt
    };
    
    // Broadcast message to everyone in the chat room
    io.to(chatId).emit('new-message', fullMessage);
    
    // Send through Kafka for additional processing (notifications, etc.)
    await producer.send({
      topic: 'new-messages',
      messages: [{ value: JSON.stringify(fullMessage) }]
    });
    
    // ACK message receipt to sender
    callback({ success: true, message: fullMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    callback({ success: false, error: 'Failed to send message' });
  }
});

// Client-side handling of incoming messages
socket.on('new-message', (message) => {
  // Check if message is from the current user
  const isOwnMessage = message.sender.id === currentUser.id;
  
  // Update chat UI with new message
  appendMessageToChat(message.chatId, message, isOwnMessage);
  
  // Play notification sound if not own message and tab not focused
  if (!isOwnMessage && !document.hasFocus()) {
    playNotificationSound();
  }
  
  // Send read receipt if chat is currently open and focused
  if (isActiveChatOpen(message.chatId)) {
    sendReadReceipt(message.chatId);
  }
});
```

#### Read Receipts

**Client to Server: Mark Messages as Read**
```javascript
// Client-side code
function sendReadReceipt(chatId) {
  socket.emit('read-receipt', {
    chatId,
    timestamp: new Date().toISOString()
  });
}

// Server-side handling
socket.on('read-receipt', async (data) => {
  const { chatId, timestamp } = data;
  
  try {
    // Mark messages as read in the database
    const { count } = await markMessagesAsRead(chatId, socket.userId, timestamp);
    
    // For direct chats, notify the other user that messages were read
    const chat = await getChatById(chatId);
    
    if (chat.isDirectChat) {
      const otherUserId = chat.participants.find(p => p.id !== socket.userId).id;
      
      // Find socket IDs for the other user
      const otherUserSocketIds = await RedisService.getUserSockets(otherUserId);
      
      // Emit read receipt to all of other user's connected devices
      otherUserSocketIds.forEach(socketId => {
        io.to(socketId).emit('message-read', {
          chatId,
          userId: socket.userId,
          readAt: timestamp
        });
      });
    }
  } catch (error) {
    console.error('Error processing read receipt:', error);
  }
});
```

#### User Presence

**Server to Client: User Online/Offline**
```javascript
// Server-side code for broadcasting user online status
io.on('connection', async (socket) => {
  const userId = socket.userId;
  
  // Get user's group chats
  const userGroups = await getUserGroups(userId);
  
  // Join all group chat rooms
  for (const group of userGroups) {
    await socket.join(group.id);
  }
  
  // Get direct chat partners
  const directChatPartners = await getDirectChatPartners(userId);
  
  // Notify direct chat partners that user is online
  directChatPartners.forEach(partnerId => {
    io.to(`user:${partnerId}`).emit('user-online', {
      userId,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', async () => {
    // Check if user has other active connections
    const hasOtherConnections = await RedisService.hasOtherActiveSockets(userId, socket.id);
    
    if (!hasOtherConnections) {
      // Only broadcast offline status if this was the last connection
      directChatPartners.forEach(partnerId => {
        io.to(`user:${partnerId}`).emit('user-offline', {
          userId,
          lastActive: new Date().toISOString()
        });
      });
    }
  });
});

// Client-side handling of online/offline events
socket.on('user-online', (data) => {
  updateUserStatus(data.userId, 'online');
});

socket.on('user-offline', (data) => {
  updateUserStatus(data.userId, 'offline', data.lastActive);
});
```

### Event Sequence Diagram

Below is a sequence diagram for a typical message flow:

```
┌──────┐          ┌────────┐          ┌────────┐          ┌──────┐
│Client│          │Socket.io│          │Database│          │Client│
│  A   │          │Server   │          │        │          │  B   │
└──┬───┘          └───┬────┘          └───┬────┘          └──┬───┘
   │                  │                    │                  │
   │                  │                    │                  │
   │   join-room      │                    │                  │
   │ ─────────────────>                    │                  │
   │                  │                    │                  │
   │  typing (true)   │                    │                  │
   │ ─────────────────>                    │                  │
   │                  │   typing-update    │                  │
   │                  │ ──────────────────────────────────────>
   │                  │                    │                  │
   │  chat-message    │                    │                  │
   │ ─────────────────>                    │                  │
   │                  │     save msg       │                  │
   │                  │ ─────────────────> │                  │
   │                  │                    │                  │
   │                  │   new-message      │                  │
   │                  │ ──────────────────────────────────────>
   │                  │                    │                  │
   │  typing (false)  │                    │                  │
   │ ─────────────────>                    │                  │
   │                  │   typing-update    │                  │
   │                  │ ──────────────────────────────────────>
   │                  │                    │                  │
   │                  │    read-receipt    │                  │
   │                  │ <──────────────────────────────────────
   │                  │                    │                  │
   │  message-read    │                    │                  │
   │ <─────────────────                    │                  │
   │                  │                    │                  │
```

## ⚙️ Installation and Setup

### Prerequisites

- Node.js (v16+)
- PostgreSQL
- Redis
- Kafka
- Docker & Docker Compose (recommended for local development)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/quick_chat.git
   cd quick_chat
   ```

2. Start infrastructure services using Docker:
   ```bash
   docker-compose up -d redis kafka postgres
   ```

3. Set up the server:
   ```bash
   cd server
   npm install
   cp .env.example .env  # Configure your environment variables
   npx prisma migrate deploy
   npm run dev
   ```

4. Set up the frontend:
   ```bash
   cd front
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run dev
   ```

5. Access the application at `http://localhost:3000`

### Environment Variables

**Backend (.env)**:
```
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/quickchat"

# Redis
REDIS_URL="redis://localhost:6379"

# Kafka
KAFKA_BROKER="localhost:9092"
KAFKA_USERNAME="username"
KAFKA_PASSWORD="password"

# Server
PORT=8000
JWT_SECRET="your-secret-key"
```

**Frontend (.env)**:
```
NEXT_PUBLIC_API_URL="http://localhost:8000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:8000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

## 🐳 Docker Deployment

```bash
docker-compose up -d
```

## 📊 Performance Considerations

- Horizontal scaling of API servers behind a load balancer
- Redis caching for session management and frequent queries
- Kafka for asynchronous message processing
- Database sharding for high-volume chat history

## 🛠️ Contributing

We welcome contributions to QuickChat! Please follow these steps to contribute:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to your branch: `git push origin feature/amazing-feature`
7. Open a pull request

### Code Style

- We use ESLint and Prettier for code formatting
- Run `npm run lint` before submitting PRs
- Follow the existing code style patterns

### Branch Naming Convention

- `feature/`: For new features
- `bugfix/`: For bug fixes
- `docs/`: For documentation updates
- `refactor/`: For code refactoring
- `test/`: For adding tests

### Commit Messages

Please use semantic commit messages:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Changes to the build process or auxiliary tools

Example: `feat: add typing indicators to group chats`

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Express.js](https://expressjs.com/)
- [Next.js](https://nextjs.org/)
- [Redis](https://redis.io/)
- [Kafka](https://kafka.apache.org/)
- [Prisma](https://www.prisma.io/)
- [Socket.io](https://socket.io/)

## 📧 Contact

Project Lead - [tushars7740@gmail.com](mailto:tushars7740@gmail.com)

Project Link: [https://github.com/Tushar-Sukhwal/Chatty](https://github.com/Tushar-Sukhwal/Chatty)
