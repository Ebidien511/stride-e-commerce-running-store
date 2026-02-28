export const uploadImage = async (file) => {
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  
  console.log('Cloud name:', CLOUD_NAME)
  console.log('Upload preset:', UPLOAD_PRESET)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', 'stride_products')

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  console.log('Response status:', res.status)
  const data = await res.json()
  console.log('Response data:', data)

  if (!res.ok) throw new Error('Image upload failed')
  return data.secure_url
}