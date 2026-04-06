import makeWASocket, { DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState } from "baileys";
import path from "path";

type WASocket = ReturnType<typeof makeWASocket>;

// En desarrollo Next.js recarga los módulos — guardamos el estado en el objeto global
// para que sobreviva los hot reloads
const g = global as typeof global & {
  _wa?: {
    sock: WASocket | null;
    qr: string | null;
    connected: boolean;
    starting: boolean;
  };
};

if (!g._wa) {
  g._wa = { sock: null, qr: null, connected: false, starting: false };
}

const AUTH_DIR = path.join(process.cwd(), "baileys_auth");

export function getWhatsAppStatus() {
  return { connected: g._wa!.connected, qr: g._wa!.qr };
}

export async function initWhatsApp() {
  if (g._wa!.starting || (g._wa!.sock && g._wa!.connected)) return;
  g._wa!.starting = true;

  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      browser: ["Inmolive", "Chrome", "1.0.0"],
    });

    g._wa!.sock = sock;

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        g._wa!.qr = qr;
        g._wa!.connected = false;
        console.log("[WA] QR listo — escanealo desde el panel");
      }

      if (connection === "open") {
        g._wa!.connected = true;
        g._wa!.qr = null;
        g._wa!.starting = false;
        console.log("[WA] Conectado");
      }

      if (connection === "close") {
        g._wa!.connected = false;
        g._wa!.starting = false;
        const code = (lastDisconnect?.error as any)?.output?.statusCode;
        if (code !== DisconnectReason.loggedOut) {
          console.log("[WA] Reconectando...");
          g._wa!.sock = null;
          setTimeout(() => initWhatsApp(), 3000);
        } else {
          console.log("[WA] Sesión cerrada — necesita nuevo QR");
          g._wa!.qr = null;
          g._wa!.sock = null;
        }
      }
    });
  } catch (err) {
    g._wa!.starting = false;
    console.error("[WA] Error al iniciar:", err);
  }
}

export async function sendWhatsAppMessage(phone: string, message: string) {
  if (!g._wa!.connected || !g._wa!.sock) throw new Error("WhatsApp no está conectado");
  const jid = `${phone.replace(/\D/g, "")}@s.whatsapp.net`;
  await g._wa!.sock.sendMessage(jid, { text: message });
}
