// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const bucketName = process.env.SUPABASE_BUCKET_NAME;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucketIfNotExists() {
  try {
    // Check if the bucket already exists
    const { data, error } = await supabase.storage.getBucket(bucketName);

    if (error && error.message !== 'Bucket not found') {
      throw error;
    }

    if (data) {
      console.log(`Bucket ${bucketName} already exists`);
      return;
    }

    // Create the bucket
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucketName, { public: false });

    if (createError) throw createError;

    console.log(`Bucket ${bucketName} created successfully`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createBucketIfNotExists();
