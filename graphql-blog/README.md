# GraphQL Blog API

A full-featured blog REST API built with GraphQL, Apollo Server, Prisma, and PostgreSQL. Includes authentication, cursor-based pagination, filtering, and performance optimizations.

---

## Tech Stack

- **Node.js** + **TypeScript**
- **Apollo Server** — GraphQL server
- **GraphQL** — API query language
- **Prisma** — ORM and database migrations
- **PostgreSQL** — relational database (hosted on Neon)
- **JWT** — authentication
- **bcryptjs** — password hashing
- **DataLoader** — batching and caching for performance

---

## Features

- User registration and login with JWT authentication
- Create, read posts and comments
- Like and dislike comments
- Filter posts by user or tag
- Cursor-based pagination (Relay spec) on posts
- N+1 problem resolved with DataLoader
- Seed script for test data

---

## Project Structure

```
graphql-blog/
├── generated/             # Prisma generated client (auto-generated, not committed)
├── prisma/
│   ├── migrations/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Seed script
│   └── prisma.config.ts   # Prisma configuration
├── src/
│   ├── loaders/           # DataLoader instances
│   │   ├── user.ts
│   │   └── post.ts
│   ├── repository/        # Database access layer
│   │   ├── users.ts
│   │   ├── post.ts
│   │   └── comments.ts
│   ├── resolvers/         # GraphQL resolvers
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── post.ts
│   │   └── comment.ts
│   ├── db.ts              # Prisma client instance
│   ├── index.ts           # Server entry point
│   └── schema.graphql     # GraphQL schema (SDL)
├── .env                   # Environment variables (not committed)
├── .env.example           # Environment variables template
└── package.json
```

---

## Getting Started

### Requirements

- Node.js 18+
- A PostgreSQL-compatible database supported by Prisma (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), or local PostgreSQL)

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

To generate a secure `JWT_SECRET`, run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Setup

Run migrations to create the database schema:

```bash
npx prisma migrate deploy
```

Generate the Prisma client:

```bash
npx prisma generate
```

Optionally, seed the database with test data:

```bash
npx prisma db seed
```

### Running the Server

```bash
npm run dev     # development
npm start       # production (compiles TypeScript first)
```

The server will be available at `http://localhost:4000`. Apollo Sandbox is accessible at the same URL for interactive query testing.

---

## Environment Variables

See `.env.example` for reference:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-secret-here"
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens |

---

## Technical Highlights

### Architecture: Resolver → Repository → Database

Resolvers handle GraphQL logic and error throwing. Repositories handle all database access via Prisma. This separation means switching ORMs or databases only requires changes in the repository layer.

### Authentication Flow

Protected mutations (`addPost`, `addComment`, `likeComment`, `dislikeComment`) require a valid JWT in the `Authorization` header. The token is verified in the Apollo Server context before any resolver executes, and the authenticated user is injected into `context.user`.

### N+1 Problem and DataLoader

Without optimization, fetching 10 posts with their authors would trigger 11 database queries (1 for posts + 1 per author). DataLoader batches these into a single query per tick, regardless of how many posts are requested. This is applied to all relation resolvers (`Post.user`, `Comment.user`, `Comment.post`, `User.posts`).

### Cursor-Based Pagination

Posts support Relay-style cursor pagination. Cursors are base64-encoded post IDs. Prisma's `cursor`, `take`, and `skip` are used under the hood. This approach is more stable than offset pagination when data changes between requests.

---

## API Reference & Examples

Add the following header to all protected requests:

```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

---

### Authentication

**Register**
```graphql
mutation {
  register(username: "lucas123", email: "lucas@example.com", password: "mypassword") {
    token
    user {
      id
      username
    }
  }
}
```

**Login**
```graphql
mutation {
  login(username: "lucas123", password: "mypassword") {
    token
    user {
      id
      username
    }
  }
}
```

---

### Users

**Get user by ID**
```graphql
query {
  userById(id: "USER_ID") {
    id
    username
    email
    posts {
      id
      text
    }
  }
}
```

**Get user by username**
```graphql
query {
  userByUsername(username: "lucas123") {
    id
    username
    email
  }
}
```

---

### Posts

**Get all posts**
```graphql
query {
  posts {
    edges {
      cursor
      node {
        id
        text
        tags
        user {
          username
        }
        comments {
          text
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**Get posts with pagination**
```graphql
query {
  posts(first: 3) {
    edges {
      cursor
      node {
        id
        text
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**Get next page using cursor**
```graphql
query {
  posts(first: 3, after: "END_CURSOR_HERE") {
    edges {
      cursor
      node {
        id
        text
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**Filter posts by user**
```graphql
query {
  posts(userId: "USER_ID") {
    edges {
      node {
        text
        tags
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**Filter posts by tag**
```graphql
query {
  posts(tag: "graphql") {
    edges {
      node {
        text
        tags
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**Get post by ID**
```graphql
query {
  postById(id: "POST_ID") {
    id
    text
    tags
    user {
      username
    }
    comments {
      id
      text
      likes
      dislikes
      user {
        username
      }
    }
  }
}
```

**Create a post** *(requires authentication)*
```graphql
mutation {
  addPost(text: "My first post!", tags: ["graphql", "backend"]) {
    id
    text
    tags
    user {
      username
    }
  }
}
```

---

### Comments

**Add a comment** *(requires authentication)*
```graphql
mutation {
  addComment(text: "Great post!", postId: "POST_ID") {
    id
    text
    user {
      username
    }
    post {
      text
    }
  }
}
```

**Like a comment** *(requires authentication)*
```graphql
mutation {
  likeComment(id: "COMMENT_ID") {
    id
    likes
  }
}
```

**Dislike a comment** *(requires authentication)*
```graphql
mutation {
  dislikeComment(id: "COMMENT_ID") {
    id
    dislikes
  }
}
```