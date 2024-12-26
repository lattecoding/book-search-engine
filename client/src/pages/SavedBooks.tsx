import { Container, Card, Button, Row, Col } from "react-bootstrap";
import { useQuery, useMutation } from "@apollo/client"; // Import Apollo hooks
import { GET_ME } from "../utils/queries"; // Import the GET_ME query
import { REMOVE_BOOK } from "../utils/mutations"; // Import the REMOVE_BOOK mutation
import Auth from "../utils/auth";
import { removeBookId } from "../utils/localStorage";
import type { User } from "../models/User";
import type { Book } from "../models/Book";

const SavedBooks = () => {
  // Use Apollo's useQuery to fetch user data
  const { loading, data } = useQuery(GET_ME);

  // Use Apollo's useMutation hook for removing a book
  const [removeBook] = useMutation(REMOVE_BOOK);

  // If the query is loading, show a loading message
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  // If there's no user data, display an error
  if (!data?.me) {
    return <h2>No user data found.</h2>;
  }

  const userData: User = data.me;

  // Handle deleting a book using Apollo's useMutation hook
  const handleDeleteBook = async (bookId: string) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { data } = await removeBook({
        variables: { bookId },
      });

      // On success, update the user data and remove the book ID from localStorage
      if (data) {
        removeBookId(bookId); // Keep this function to update localStorage
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className="pt-5">
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? "book" : "books"
              }:`
            : "You have no saved books!"}
        </h2>
        <Row>
          {userData.savedBooks.map((book: Book) => {
            return (
              <Col md="4" key={book.bookId}>
                <Card border="dark">
                  {book.image ? (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant="top"
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className="small">Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button
                      className="btn-block btn-danger"
                      onClick={() => handleDeleteBook(book.bookId)}
                    >
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
