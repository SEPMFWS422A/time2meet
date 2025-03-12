export default async function login(user: { email: string, password: string }) {
    try {
        return await fetch("/api/userauth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user)
        })
            .then(res => res.json())
            .then((data: {message: string, success: boolean}) => data.success ? data.message : null);
    } catch (err) {
        if (err instanceof Error) console.error(err);
    }
}
