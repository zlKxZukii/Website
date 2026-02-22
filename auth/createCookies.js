export async function createCookie(res, login_key) {
    res.cookie("access_validator", login_key, { signed: true, secure: true, httpOnly: true, maxAge: 60 * 60 * 1000 * 24 * 14 })
}