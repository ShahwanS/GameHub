import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateOrJoinRoom from '../CreateOrJoinRoom'; 

describe('CreateOrJoinRoom Component', () => {
  // Mock functions for onCreate and onJoin props
  // jest.fn() creates a mock function that Jest can track (how many times it's called, with what arguments, etc.)
  const mockOnCreate = jest.fn();
  const mockOnJoin = jest.fn();

  // Helper function to render the component with default mocks
  // This avoids repeating the same render logic in every test
  const renderComponent = () => {
    render(<CreateOrJoinRoom onCreate={mockOnCreate} onJoin={mockOnJoin} />);
  };

  // Before each test, reset the mock functions to ensure a clean state for each test run
  beforeEach(() => {
    mockOnCreate.mockClear(); // Clears all information stored in the mockFn.mock.calls and mockFn.mock.instances arrays.
    mockOnJoin.mockClear();
  });

  describe('Initial Rendering', () => {
    test('renders all input fields and buttons', () => {
      renderComponent();

      // getByPlaceholderText is good for inputs where placeholder is a key identifier
      expect(screen.getByPlaceholderText(/Your name/i)).toBeInTheDocument();

      // getByRole is preferred for accessibility; buttons have a 'button' role
      expect(screen.getByRole('button', { name: /Create New Room/i })).toBeInTheDocument();

      expect(screen.getByPlaceholderText(/Room Code/i)).toBeInTheDocument();

      expect(screen.getByRole('button', { name: /Join Room/i })).toBeInTheDocument();
    });

    test('does not display an error message initially', () => {
      renderComponent();

      // Use queryByTestId to check for the absence of the error message container
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  describe('Input Field Interactions', () => {
    test('allows typing in the "Your name" input field', () => {
      renderComponent();
      const nameInput = screen.getByPlaceholderText(/Your name/i) as HTMLInputElement; // Cast to HTMLInputElement for 'value' property

      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      expect(nameInput.value).toBe('Test User');
    });

    test('allows typing in the "Room Code" input field', () => {
      renderComponent();
      const roomCodeInput = screen.getByPlaceholderText(/Room Code/i) as HTMLInputElement;

      fireEvent.change(roomCodeInput, { target: { value: 'XYZ123' } });
      expect(roomCodeInput.value).toBe('XYZ123');
    });
  });

  describe('"Create New Room" Functionality', () => {
    test('shows an error if name is empty when trying to create a room', () => {
      renderComponent();
      const createButton = screen.getByRole('button', { name: /Create New Room/i });

      fireEvent.click(createButton);

      expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter your name to create a room.');
      expect(mockOnCreate).not.toHaveBeenCalled();
    });

    test('calls onCreate and shows loading state when name is provided', async () => {
      // Mock onCreate to return a promise that never resolves for this specific test
      // This allows us to check the loading state without the promise resolving too quickly
      mockOnCreate.mockImplementationOnce(() => new Promise(() => {})); 

      renderComponent();
      const nameInput = screen.getByPlaceholderText(/Your name/i);
      const createButton = screen.getByRole('button', { name: /Create New Room/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.click(createButton);

      // findByRole is used for async changes, it waits for the element to appear
      expect(await screen.findByRole('button', { name: /Creating.../i })).toBeInTheDocument();
      expect(createButton).toBeDisabled(); // Button should be disabled
      expect(mockOnCreate).toHaveBeenCalledWith('Test User');
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument(); // No error initially
    });

    test('shows an error message if onCreate rejects', async () => {
      // Mock onCreate to reject with an error
      mockOnCreate.mockRejectedValueOnce(new Error('Network Error'));

      renderComponent();
      const nameInput = screen.getByPlaceholderText(/Your name/i);
      const createButton = screen.getByRole('button', { name: /Create New Room/i });

      fireEvent.change(nameInput, { target: { value: 'Error User' } });
      fireEvent.click(createButton);

      expect(await screen.findByTestId('error-message')).toHaveTextContent('Network Error');
      // Button should be enabled again, and text should be back to normal
      expect(screen.getByRole('button', { name: /Create New Room/i })).not.toBeDisabled();
      expect(mockOnCreate).toHaveBeenCalledWith('Error User');
    });
  });

  describe('"Join Room" Functionality', () => {
    test('shows an error if name or room code is empty when trying to join', () => {
      renderComponent();
      const joinButton = screen.getByRole('button', { name: /Join Room/i });
      const nameInput = screen.getByPlaceholderText(/Your name/i);
      const roomCodeInput = screen.getByPlaceholderText(/Room Code/i);

      // Test Case 1: Both empty
      fireEvent.click(joinButton);
      expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter both room code and your name to join.');
      expect(mockOnJoin).not.toHaveBeenCalled();

      // Test Case 2: Only name provided
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.click(joinButton);
      expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter both room code and your name to join.');
      expect(mockOnJoin).not.toHaveBeenCalled();

      // Test Case 3: Only room code provided (clear name input first)
      fireEvent.change(nameInput, { target: { value: '' } });
      fireEvent.change(roomCodeInput, { target: { value: 'CF5I' } });
      fireEvent.click(joinButton);
      expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter both room code and your name to join.');
      expect(mockOnJoin).not.toHaveBeenCalled();
    });

    test('calls onJoin and shows loading state when name and room code are provided', async () => {
      // Mock onJoin to return a promise that never resolves for this specific test
      mockOnJoin.mockImplementationOnce(() => new Promise(() => {}));

      renderComponent();
      const nameInput = screen.getByPlaceholderText(/Your name/i);
      const roomCodeInput = screen.getByPlaceholderText(/Room Code/i);
      const joinButton = screen.getByRole('button', { name: /Join Room/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(roomCodeInput, { target: { value: 'CF5I' } });
      fireEvent.click(joinButton);

   
      expect(joinButton).toBeDisabled(); // Button should be disabled
      expect(mockOnJoin).toHaveBeenCalledWith('CF5I', 'Test User');
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument(); // No error initially
    });

    test('clears loading state and shows no error if onJoin resolves successfully', async () => {
      mockOnJoin.mockResolvedValueOnce(Promise.resolve()); // Simulate successful join

      renderComponent();
      const nameInput = screen.getByPlaceholderText(/Your name/i);
      const roomCodeInput = screen.getByPlaceholderText(/Room Code/i);
      const joinButton = screen.getByRole('button', { name: /Join Room/i });

      fireEvent.change(nameInput, { target: { value: 'Test User Join Success' } });
      fireEvent.change(roomCodeInput, { target: { value: 'CF5I' } });
      fireEvent.click(joinButton);


      expect(joinButton).toBeDisabled();

      // Wait for the promise to resolve and UI to update
      // The button should revert to its original state
      expect(await screen.findByRole('button', { name: /Join Room/i })).toBeEnabled();
      expect(screen.queryByText(/Joining.../i)).not.toBeInTheDocument(); 
      expect(mockOnJoin).toHaveBeenCalledWith('CF5I', 'Test User Join Success');
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    test('shows an error message if onJoin rejects', async () => {
      // Mock onJoin to reject with an error
      mockOnJoin.mockRejectedValueOnce(new Error('Invalid room code'));

      renderComponent();
      const nameInput = screen.getByPlaceholderText(/Your name/i);
      const roomCodeInput = screen.getByPlaceholderText(/Room Code/i);
      const joinButton = screen.getByRole('button', { name: /Join Room/i });

      fireEvent.change(nameInput, { target: { value: 'Error User' } });
      fireEvent.change(roomCodeInput, { target: { value: 'FAIL123' } });
      fireEvent.click(joinButton);

      expect(await screen.findByTestId('error-message')).toHaveTextContent('Invalid room code');
      // Button should be enabled again, and text should be back to normal
      expect(screen.getByRole('button', { name: /Join Room/i })).not.toBeDisabled();
      expect(mockOnJoin).toHaveBeenCalledWith('FAIL123', 'Error User');
    });
  });
});
