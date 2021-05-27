const logout = async () => {
  try {
    console.log("alo");
    const res = await axios({
      method: "GET",
      url: "http://localhost:3000/logout",
    });

    if (res.data.status === "success") location.assign("/index");
  } catch (error) {
    alert("error", "Error logging out! Try again");
  }
};
