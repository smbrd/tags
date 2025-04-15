const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

// Mock configuration endpoint
app.get('/config', (req, res) => {
  res.json({
    componentName: 'dynamic-component',
    elements: [
      {
        type: 'text',
        content: 'User: ${name}'
      },
      {
        type: 'text',
        content: 'Email: ${email}'
      },
      {
        type: 'button',
        label: 'View Profile',
        action: {
          type: 'custom',
          payload: { userId: '${id}' }
        }
      },
      {
        type: 'link',
        label: 'Visit Website',
        href: '${website}'
      }
    ]
  });
});

// Mock data endpoint
app.get('/data', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      website: 'https://example.com/john'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      website: 'https://example.com/jane'
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      website: 'https://example.com/bob'
    }
  ]);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Mock server running at http://localhost:${PORT}`);
}); 