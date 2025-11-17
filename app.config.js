import os from "os";

export default () => {
	// detect local lan ipv4
	const interfaces = os.networkInterfaces();
	const wifi =
		interfaces["wlan0"] ||
		interfaces["Wi-Fi"] ||
		interfaces["en0"] ||
		interfaces["Ethernet"];
	const lanIp = wifi?.find((i) => i.family === "IPv4")?.address;

	return {
		expo: {
			name: "lyftsync",
			slug: "lyftsync",
			version: "1.0.0",
			orientation: "portrait",
			icon: "./assets/images/icon.png",
			scheme: "lyftsync",
			userInterfaceStyle: "automatic",
			newArchEnabled: true,

			ios: {
				supportsTablet: true,
			},

			android: {
				adaptiveIcon: {
					foregroundImage: "./assets/images/circlelogo.png",
					backgroundColor: "#ffffff",
				},
				edgeToEdgeEnabled: true,
			},

			web: {
				bundler: "metro",
				output: "static",
				favicon: "./assets/images/favicon.png",
			},

			plugins: [
				[
					"expo-splash-screen",
					{
						image: "./assets/images/circlelogo.png",
						imageWidth: 200,
						resizeMode: "contain",
						backgroundColor: "#ffffff",
					},
				],
				"expo-secure-store",
				"expo-font",
				"expo-web-browser",
			],

			experiments: {
				typedRoutes: true,
			},

			extra: {
				API_HOST: lanIp, // auto-detected IP here
			},
		},
	};
};
