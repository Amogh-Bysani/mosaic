import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import { z } from "zod";
const schema=z.object({sessionName:z.string().min(1).max(200),role:z.union([z.literal(0),z.literal(1)]).default(0),userIdentity:z.string().min(1).max(64)});
export async function POST(req:Request){const parsed=schema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid request"},{status:400});const key=process.env.ZOOM_VIDEO_SDK_KEY,secret=process.env.ZOOM_VIDEO_SDK_SECRET;if(!key||!secret)return NextResponse.json({error:"Zoom Video SDK credentials are not configured"},{status:503});const now=Math.floor(Date.now()/1000);const token=await new SignJWT({app_key:key,tpc:parsed.data.sessionName,role_type:parsed.data.role,user_identity:parsed.data.userIdentity,version:1,iat:now-30,exp:now+7200}).setProtectedHeader({alg:"HS256",typ:"JWT"}).sign(new TextEncoder().encode(secret));return NextResponse.json({token,sdkKey:key})}

