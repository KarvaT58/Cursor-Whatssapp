export default function JoinGroupPage() {
  return (
    <html>
      <head>
        <title>Link Universal</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #4ade80, #3b82f6, #8b5cf6);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
          }
          .container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #1f2937;
            margin-bottom: 1rem;
          }
          p {
            color: #6b7280;
            margin-top: 1rem;
          }
        </style>
      </head>
      <body>
        <div className="container">
          <h1>Link Universal Funcionando!</h1>
          <p>A página está carregando corretamente.</p>
          <p>Sistema de Link Universal Ativo</p>
        </div>
      </body>
    </html>
  )
}