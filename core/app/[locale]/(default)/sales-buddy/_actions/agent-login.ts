'use server'
import { cookies } from 'next/headers';

export async function agentLogin(emailId: any, password: any) {
  try {
    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    const apiPath = process.env.SALES_BUDDY_API_PATH!;

    const postData = JSON.stringify({
      email: emailId,
      password: password,
    });

    const response = await fetch(`${apiUrl}${apiEnv}${apiPath}login-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: postData,
    });

    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }

    const jsonData = await response.json();
    if (jsonData.output.status != 200) {
        throw new Error(jsonData.output.data);
    }
    return { status: 200, data: jsonData };
  } catch (error) {
    return { status: 500, error: error instanceof Error ? error.message : JSON.stringify(error) };
  }
}

export  const storeAgentLoginStatusInCookies = async(status: any) => {
  const cookieStore = await cookies();
  console.log('--------------------------------',status);
  
    cookieStore.set({
      name: 'agent_login',
      value: status,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    });

}
