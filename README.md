# Luxacom Interior Store

Welcome to my Luxacom Interior Store project! This is a fully functional interior design store website that I built with a complete admin panel for managing products and blog posts. I also added a backend server to make sure all changes are synced across users in real-time.

## What I Built

✅ Full product catalog with shopping functionality  
✅ Blog section where I can share design tips and news  
✅ Admin panel to easily add/delete products and blog posts  
✅ WhatsApp integration so customers can place orders directly  
✅ Backend server that keeps everything in sync  
✅ Responsive design that works on all devices  

## How to Get It Running

### Step 1: Get Node.js
Head to https://nodejs.org/ and download the LTS version. This is what powers my backend server.

### Step 2: Install the Packages
Open PowerShell in my project folder and run:
```
npm install
```

### Step 3: Start the Server
Just run:
```
npm start
```

You should see this message:
```
Luxacom Interior Store server running on http://localhost:3000
Admin password: admin123
```

### Step 4: Open It Up
Go to your browser and visit:
```
http://localhost:3000
```

Done! The site is live locally.

## Using the Admin Panel

1. Click the **"Admin Login"** button at the top right
2. Enter the password: `admin123`
3. Now I can:
   - **Add New Products** - Enter the name, description, price, and upload an image
   - **Delete Products** - Just click the delete button on any product
   - **Create Blog Posts** - Add a title, excerpt, date, and featured image
   - **Delete Blog Posts** - Remove any blog post I no longer want

## How Everything Works Together

- **Frontend Files**: `index.html`, `style.css`, `script.js` - This is what users see
- **Backend**: `server.js` - This is the brains of the operation, built with Node.js and Express
- **Database**: `data.json` - All my products and blogs are stored here as JSON

When I make changes through the admin panel, they instantly save to `data.json` and every user sees them right away!

## Changing the Admin Password

If I want a different password:
1. Open `script.js` and find: `const ADMIN_PASSWORD = 'admin123';`
2. Replace `'admin123'` with my new password
3. Do the same in `server.js`

## Common Issues & Fixes

**Getting an error about 'express' not found?**
- Just run `npm install` again

**Port 3000 is already in use?**
- Edit `server.js` and change `const PORT = 3000;` to something like `3001`

**Images aren't showing up?**
- Make sure the image files are in the same folder as `index.html`
- Double-check the image filenames in my admin panel

## Want to Take This Live on the Internet?

I can deploy this to services like Heroku, Railway, or Render (they even have free options):
1. Push my code to GitHub
2. Connect my GitHub repo to one of these hosting services
3. Follow their setup steps and I'm live!

## Project Structure

```
Luxacom Interior Store/
├── index.html          # The main website
├── style.css           # All the styling
├── script.js           # Frontend magic happens here
├── server.js           # Backend server code
├── data.json           # My products & blogs database
├── package.json        # Node dependencies
├── *.jfif              # Product/blog images
└── README.md           # This file
```

## Final Notes

This project was really fun to build! I combined HTML, CSS, JavaScript, Node.js, and Express to create something I can actually use to manage my interior design store.

Happy selling! 
