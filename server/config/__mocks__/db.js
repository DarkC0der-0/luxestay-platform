// server/config/__mocks__/db.js

const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

const mockPool = {
  connect: jest.fn().mockResolvedValue(mockClient),
  query: jest.fn(),
  on: jest.fn(),
};

module.exports = {
  query: mockPool.query,
  pool: mockPool,
  // Helper to allow tests to reset the mock between tests
  _resetMocks: () => {
    mockClient.query.mockReset();
    mockClient.release.mockReset();
    mockPool.connect.mockClear();
    mockPool.query.mockReset();
  },
  _mockClient: mockClient,
};
