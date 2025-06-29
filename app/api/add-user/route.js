import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils";
import { User } from "@/app/lib/models";

export async function POST(req) {
    try {
        await connectToDB();
        const formData = await req.formData();

        const username = formData.get("username");
        const email = formData.get("email");

        // Check if user with same username or email exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });
        if (existingUser) {
            return NextResponse.json({ error: "Username or Email already exists" }, { status: 400 });
        }

        const newUser = new User({
            username,
            email,
            phone: formData.get("phone"),
            latitude: parseFloat(formData.get("latitude")),
            longitude: parseFloat(formData.get("longitude")),
        });

        await newUser.save();

        return NextResponse.json({ message: "User created successfully" }, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}
