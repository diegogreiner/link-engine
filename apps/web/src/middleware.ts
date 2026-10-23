import { withAuth } from "next-auth/middleware";

// Sem `pages.signIn`, o next-auth manda quem não está logado para a página
// padrão dele (/api/auth/signin, em inglês). Aqui apontamos para o /login do app.
export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/", "/links/:path*", "/analytics/:path*"],
};
