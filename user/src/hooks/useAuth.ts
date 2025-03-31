import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function useAuth() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const token = localStorage.getItem("dojo-pass-user-token");
				if (!token) {
					router.push("/login");
					return;
				}

				setIsAuthenticated(true);
			} catch (err: any) {
				setError(err.message);
				router.push("/login");
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, [router]);

	return { isAuthenticated, loading, error };
}

export default useAuth;
