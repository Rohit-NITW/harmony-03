// Helper script to create a volunteer account
// Run this in your browser console on the volunteer login page

// Function to create a volunteer account
async function createVolunteerAccount() {
  const volunteerData = {
    email: 'volunteer@harmony.edu',
    password: 'volunteer123',
    name: 'Sarah Thompson',
    bio: 'Psychology student passionate about peer support and mental health advocacy. I\'ve been through my own challenges and want to help others.',
    specialties: ['Anxiety', 'Academic Stress', 'Social Anxiety', 'Self-Esteem']
  };

  console.log('Creating volunteer account with data:', volunteerData);
  
  // You would typically call your registration function here
  // For now, just log the data that should be used
  console.log('To create this account:');
  console.log('1. Go to /volunteer/login');
  console.log('2. Click "Want to volunteer? Create an account"');
  console.log('3. Fill in the form with:');
  console.log(`   Email: ${volunteerData.email}`);
  console.log(`   Password: ${volunteerData.password}`);
  console.log(`   Name: ${volunteerData.name}`);
  console.log(`   Bio: ${volunteerData.bio}`);
  console.log(`   Specialties: ${volunteerData.specialties.join(', ')}`);
  
  return volunteerData;
}

// Call the function
createVolunteerAccount();