import { db } from "@/lib/firebase"; // Path to your firebase init file
import { collection, addDoc } from "firebase/firestore"; 

/**
 * Adds a new shoe product to the 'products' collection.
 */
export async function addProductToFirestore() {
  try {
    const productData = {
      brand: "Adidas",
      name: "Super fast 90",
      price: 9000,
      // We use a conditional check here: if it's null, we omit it
      ...(null && { originalPrice: null }), 
      tag: "New",
      category: "road",
      arch: "Neutral",
      terrain: "Road",
      drop: "10mm",
      weight: "290g",
      emoji: "🦍",
      description: "A premium daily trainer that provides a springy, soft ride for every mile.",
      features: [
        "Dual-density foam midsole",
        "Engineered mesh for breathability",
        "Plush tongue and lining"
      ],
      createdAt: new Date() // Good practice for sorting later
    };

    const docRef = await addDoc(collection(db, "products"), productData);
    
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}