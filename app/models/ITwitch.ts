interface ITwitchStream {
  user_name: string
  game_name: string
  thumbnail_url: string
}

interface ITwitchUser {
  profile_image_url: string;
}

interface ITwitchResponse {
  users: ITwitchUser;
  streams: ITwitchStream
}

export default ITwitchResponse;
