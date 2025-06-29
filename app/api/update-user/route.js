import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils";
import { User } from "@/app/lib/models";

export async function POST(req) {
    try {
        await connectToDB();
        const formData = await req.formData();

        const id = formData.get("id");


        const isActiveRaw = formData.get("isActive");
        console.log("isActiveRaw:", isActiveRaw, typeof isActiveRaw);
        const isActive = isActiveRaw == "true"; 

        const updates = {
            username: formData.get("username"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            isActive: isActive, 
            latitude: parseFloat(formData.get("latitude")),
            longitude: parseFloat(formData.get("longitude")),
        };


        await User.findByIdAndUpdate(id, updates);

        return NextResponse.json({ message: "User updated successfully" }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}
