# Ikram Hospital Website

A modern, professional, and fully responsive hospital website with dynamic features and user-friendly interface.

## Features

✨ **Key Features:**
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **Automatic Slider** - Hero section with auto-rotating image carousel
- **Doctor Directory** - Browse doctors by specialties
- **Appointment Booking** - Easy-to-use appointment booking form
- **Department Information** - Comprehensive department details
- **Contact Information** - Multiple ways to reach the hospital
- **24/7 Availability** - Highlighting round-the-clock services
- **Mobile Navigation** - Hamburger menu for mobile devices
- **Smooth Scrolling** - Seamless navigation between sections
- **Social Media Links** - Connected footer with social platforms

## Files Included

```
website/
├── index.html          # Main HTML file with page structure
├── styles.css          # Complete CSS styling and responsive design
├── script.js           # JavaScript for interactivity and functionality
└── README.md           # This documentation file
```

## How to Use

1. **Open the Website:**
   - Simply open `index.html` in your web browser
   - Or use a local server (recommended for better performance)

2. **Using Live Server (Recommended):**
   - Install VS Code Live Server extension
   - Right-click on `index.html` and select "Open with Live Server"
   - The website will open in your default browser

3. **Using Python Server:**
   ```bash
   # Python 3.x
   python -m http.server 8000
   
   # Python 2.x
   python -m SimpleHTTPServer 8000
   ```
   Then open `http://localhost:8000` in your browser

## Customization

### Change Hospital Name
Replace "Ikram Hospital" with your hospital's name in:
- `index.html` - Logo and titles
- `styles.css` - If needed for branding

### Update Contact Information
Edit these sections in `index.html`:
- Phone numbers in the Contact section
- Email addresses
- Physical address
- Hospital hours

### Add Your Doctors
Modify the doctors section in `index.html`:
- Replace doctor names and specialties
- Update doctor images (replace the image URLs)
- Adjust experience details

### Update Services
Edit the services grid in `index.html` to match your hospital's departments

### Change Colors
Edit the color variables in `styles.css`:
```css
:root {
    --primary-color: #0066cc;      /* Main brand color */
    --secondary-color: #00a86b;    /* Accent color */
    --dark-color: #1a1a1a;
    --light-color: #f5f5f5;
    /* ... */
}
```

### Change Images
Replace image URLs in:
- Hero slider images
- Doctor profile pictures
- About section image
- Any other images in the content

## Sections Included

1. **Navigation Bar** - Fixed header with hospital logo and menu
2. **Hero Slider** - Auto-rotating carousel with CTA buttons
3. **Quick Links** - Fast access to key services
4. **About Section** - Hospital overview and highlights
5. **Why Choose Us** - Four key benefits
6. **Services & Departments** - 8 different medical services
7. **Doctors** - Featured doctors with specialties
8. **Departments** - 6 major departments overview
9. **Contact & Appointments** - Contact info and booking form
10. **Footer** - Links, social media, and copyright info

## Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 768px to 1199px
- **Mobile**: Below 768px
- **Small Mobile**: Below 480px

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Features Breakdown

### Slider
- Auto-rotates every 5 seconds
- Manual navigation with prev/next arrows
- Dot indicators for slide selection
- Smooth fade transitions

### Appointment Form
- Validates all required fields
- Success message on submission
- Department selection dropdown
- Mobile-friendly form layout

### Mobile Navigation
- Hamburger menu on screens below 768px
- Smooth toggle animation
- Auto-closes when link is clicked

### Smooth Scrolling
- Click navigation links for smooth scroll
- Active link highlighting based on scroll position
- Responsive to mobile navigation

## Adding Backend Functionality

To fully integrate appointment bookings:

1. **Connect to a Backend Server** - Set up a server to handle form submissions
2. **Email Integration** - Send confirmation emails to patients
3. **Database** - Store appointment data
4. **Admin Panel** - Manage appointments and doctor schedules

## Future Enhancements

- [ ] User login/authentication system
- [ ] Online payment gateway
- [ ] Doctor availability calendar
- [ ] Patient testimonials/reviews
- [ ] Blog section for health tips
- [ ] Telemedicine/video consultation
- [ ] Lab test online ordering
- [ ] Prescription management
- [ ] Patient portal for medical records

## Performance Tips

1. **Optimize Images** - Compress images for faster loading
2. **Use CDN** - Serve images from a content delivery network
3. **Minify CSS/JS** - Reduce file sizes for production
4. **Caching** - Implement browser caching for repeat visitors
5. **Lazy Loading** - Load images only when visible

## Technical Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Grid and Flexbox
- **JavaScript** - Vanilla JS (no dependencies required)
- **Font Awesome** - Icon library (CDN)
- **Unsplash** - Sample images (can be replaced)

## License

This template is provided as-is for use. Customize and modify as needed for your hospital.

## Support

For customization help or questions about the website:
1. Check the inline comments in the code
2. Review the CSS variables for easy customization
3. Modify the JavaScript for additional functionality

---

**Created**: 2026
**Last Updated**: May 17, 2026
