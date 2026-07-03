import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const falKey = process.env.FAL_KEY;
console.log('Using FAL_KEY:', falKey ? `${falKey.substring(0, 10)}...` : 'undefined');

async function test() {
  if (!falKey) {
    console.error('Error: FAL_KEY not found in .env');
    process.exit(1);
  }

  const model = 'fal-ai/flux/schnell';
  const endpoint = `https://fal.run/${model}`;
  const input = {
    prompt: 'Create one accessible AAC pictogram representing: dog. Simple flat vector illustration, thick outlines, white background.',
    image_size: 'square_hd',
    num_images: 1,
    output_format: 'png',
    enable_safety_checker: true,
    safety_tolerance: '1',
  };

  try {
    console.log('Sending request to Fal AI...');
    const response = await axios.post(endpoint, input, {
      headers: { 
        'Authorization': `Key ${falKey}`, 
        'Content-Type': 'application/json' 
      },
      timeout: 30000,
    });
    
    console.log('Response Status:', response.status);
    if (response.data?.images?.[0]?.url) {
      console.log('SUCCESS! Image URL:', response.data.images[0].url);
    } else {
      console.log('FAILED! No image URL in response.');
    }
  } catch (error) {
    console.error('Error calling Fal AI:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

test();
