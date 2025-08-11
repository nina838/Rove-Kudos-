# Rove Kudos Wall (Vercel-ready)
Routes:
- `/submit` – send a kudos
- `/wall` – live wall

## Firebase Rules
Paste this in Firestore → Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /kudos/{doc} {
      allow read: if true;

      allow create: if request.resource.data.keys().hasAll(['message']) &&
                    request.resource.data.message is string &&
                    request.resource.data.message.size() > 0 &&
                    request.resource.data.message.size() <= 300 &&
                    (!('name' in request.resource.data) || request.resource.data.name is string) &&
                    (!('team' in request.resource.data) || request.resource.data.team is string) &&
                    request.time < timestamp.date(2100,1,1);
    }

    match /{document=**} {
      allow update, delete: if false;
    }
  }
}
```

## Dev
```
npm install
npm run dev
```

## Deploy to Vercel
1) Push this folder to a GitHub repo  
2) On Vercel: New Project → Import the repo → Deploy  
3) Your domain: https://YOUR-PROJECT.vercel.app

## QR links
- Wall: https://YOUR-PROJECT.vercel.app/wall
- Submit: https://YOUR-PROJECT.vercel.app/submit
