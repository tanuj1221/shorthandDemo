# Landing Page - Shorthand LMS

## Features Implemented

### 1. **Landing Navbar**
- Logo (GCC-TBC.png) on the left with "Shorthand LMS" branding
- Smooth scroll navigation to About and Courses sections
- Login button that opens an overlay modal
- Responsive mobile menu
- Transparent navbar that becomes solid on scroll

### 2. **Hero Section**
- Eye-catching headline with gradient text
- 3D animated elements (floating shapes, blobs)
- Call-to-action buttons (Get Started, Explore Courses)
- Statistics display (500+ Students, 50+ Courses, 95% Success Rate)
- Animated 3D card mockup on the right side

### 3. **About Section**
- Four feature cards with icons:
  - Focused Learning
  - Smart Technology
  - Expert Guidance
  - Student Success
- Hover animations on cards
- Statistics banner at the bottom

### 4. **Courses Section**
- Three course cards:
  - Beginner shorthand
  - Advanced Shorthand
  - Professional Certification
- Each card shows duration, student count, and rating
- Gradient color coding for different levels

### 5. **Login Overlay**
- Modal overlay for institute login
- Form with institute name and password fields
- Connects to backend API at `http://localhost:5000/api/auth/login`
- Error handling and loading states
- Smooth animations (fade in, slide up)

## Routes
- `/` - Landing page (new default)
- `/institute-login` - Direct login page (old route)
- `/admin_login` - Admin login page

## Styling
- Tailwind CSS with custom animations
- Gradient backgrounds and 3D effects
- Responsive design for all screen sizes
- Smooth transitions and hover effects

## Custom Animations
- `animate-blob` - Floating blob animation
- `animate-float` - Gentle floating motion
- `animate-fadeIn` - Fade in effect
- `animate-slideUp` - Slide up animation
