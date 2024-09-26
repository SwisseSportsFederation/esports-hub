export const loader = () => {
	let robotText;
	if (process.env.NODE_ENV === "production") {
		robotText = `
		User-agent: *
		Allow: /
		`
	} else {
		robotText = `
		User-agent: *
		Disallow: /
		`
	}
	// return the text content, a status 200 success response, and set the content type to text/plain 
	return new Response(robotText, {
		status: 200,
		headers: {
			"Content-Type": "text/plain",
		}
	});
};
