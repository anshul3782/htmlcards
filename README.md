# User Health & Location Cards

A dynamic HTML card system that fetches user data from Supabase and displays interactive visualizations for health metrics, location data, and emotional states.

## Features

- **User Profile Cards**: Display user information and profile images
- **Location Emotion Charts**: Bar charts showing emotion scores by location
- **Health Metrics Timeline**: Line charts for heart rate, HRV, and steps over time
- **Activity Heatmap**: Scatter plots showing daily activity patterns
- **Emotion Timeline**: Line charts tracking emotional intensity over time
- **Health Summary**: Key statistics and metrics overview

## Demo

Visit: `https://username.github.io/htmlcards/?phone=PHONE_NUMBER`

Replace `PHONE_NUMBER` with a valid phone number from your Supabase database.

## Setup Instructions

### 1. GitHub Repository Setup

1. Create a new GitHub repository named `htmlcards`
2. Clone the repository locally:
   ```bash
   git clone https://github.com/yourusername/htmlcards.git
   cd htmlcards
   ```

### 2. Add Files

Copy all the files from this project to your repository:
- `index.html` - Main HTML template
- `style.css` - CSS styling
- `script.js` - JavaScript for data fetching and charts
- `README.md` - This file

### 3. Enable GitHub Pages

1. Go to your repository settings
2. Scroll down to "Pages" section
3. Under "Source", select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Click "Save"

### 4. Access Your Cards

Your cards will be available at:
```
https://yourusername.github.io/htmlcards/?phone=PHONE_NUMBER
```

## Database Schema

The system expects the following Supabase tables:

### users
- `phone_no` (bigint, primary key)
- `username` (varchar)
- `created_at` (timestamp)

### user_images
- `id` (integer, primary key)
- `phone_no` (bigint)
- `image_url_1` through `image_url_10` (text)
- `uploaded_at` (timestamp)

### Health2
- `phone_no` (bigint)
- `record_timestamp` (timestamp, primary key)
- `steps` (integer)
- `heart_rate` (integer)
- `hrv` (real)
- `calories_burned` (real)
- `user_id` (varchar, primary key)

### location2
- `phone_no` (bigint, primary key)
- `latitude` (double precision)
- `longitude` (double precision)
- `timestamp` (timestamp)
- `updated_at` (timestamp)

### emotiontimeline
- `id` (bigint, primary key)
- `phone_no` (bigint)
- `emotion_name` (text)
- `intensity` (numeric)
- `updated_at` (timestamp)
- `emotion_1` through `emotion_8` (text)

## Configuration

The system is pre-configured with your Supabase credentials:
- **URL**: `https://qttedxyxszdlyiqcjxzm.supabase.co`
- **Anon Key**: Already included in `script.js`

## Usage

### Basic Usage
1. Open your GitHub Pages URL
2. Add `?phone=PHONE_NUMBER` to the end
3. Replace `PHONE_NUMBER` with a valid user's phone number

### Example URLs
```
https://yourusername.github.io/htmlcards/?phone=1234567890
https://yourusername.github.io/htmlcards/?phone=9876543210
```

## Card Types

### 1. User Profile Card
- Displays username, phone number, and member since date
- Shows up to 10 profile images in a grid
- Responsive design with hover effects

### 2. Location Emotion Card
- Horizontal bar chart showing average emotion scores by location
- Color-coded bars (green for positive, blue for neutral, red for negative)
- Based on emotion timeline data

### 3. Health Metrics Timeline
- Multi-line chart showing heart rate, HRV, and steps over time
- Different y-axes for different metrics
- Time-based x-axis with proper scaling

### 4. Activity Heatmap
- Scatter plot showing daily activity patterns
- X-axis: Date, Y-axis: Steps
- Interactive hover effects

### 5. Emotion Timeline
- Line chart showing emotion intensity over time
- Smooth curves with fill areas
- Purple color scheme

### 6. Health Summary
- Grid of key statistics
- Total steps, average heart rate, average emotion, total calories
- Clean, card-based layout

## Responsive Design

The cards are fully responsive and work on:
- Desktop computers
- Tablets
- Mobile phones

## Error Handling

The system includes comprehensive error handling:
- Missing user ID in URL
- User not found in database
- Network connection issues
- Missing data for specific metrics
- Graceful fallbacks for missing images

## Customization

### Adding New Charts
1. Add a new canvas element to `index.html`
2. Create a new render function in `script.js`
3. Add the chart to the `charts` object
4. Call the render function in `loadUserData()`

### Styling Changes
- Modify `style.css` for visual changes
- Update color schemes in chart configurations
- Adjust responsive breakpoints

### Data Sources
- Add new Supabase tables by creating fetch functions
- Modify existing charts to use new data fields
- Update summary calculations

## Troubleshooting

### Common Issues

1. **Charts not loading**
   - Check browser console for JavaScript errors
   - Verify Supabase credentials are correct
   - Ensure user ID exists in database

2. **Images not displaying**
   - Check image URLs in `user_images` table
   - Verify images are publicly accessible
   - Check for CORS issues

3. **GitHub Pages not updating**
   - Wait a few minutes for deployment
   - Check repository settings
   - Verify files are committed and pushed

4. **Mobile layout issues**
   - Test on different screen sizes
   - Check CSS media queries
   - Verify Chart.js responsive settings

## Performance

- Charts are rendered client-side using Chart.js
- Data is fetched in parallel for better performance
- Responsive design ensures good performance on all devices
- Lazy loading for images with error handling

## Security

- Uses Supabase anon key (read-only access)
- No sensitive data stored in client-side code
- CORS properly configured for Supabase
- Input validation for phone numbers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify database schema matches expectations
4. Test with known good user data

## Future Enhancements

- Real-time data updates
- Export functionality for charts
- Additional chart types
- User authentication
- Data filtering and date range selection
- Print-friendly layouts
