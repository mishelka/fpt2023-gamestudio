package sk.tuke.gamestudio.server.webservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import sk.tuke.gamestudio.common.entity.Comment;
import sk.tuke.gamestudio.common.service.CommentException;
import sk.tuke.gamestudio.common.service.CommentService;

import java.util.List;

@RestController
@RequestMapping("/api/comment")
public class CommentWebServiceREST {
    // enables to create http messages,
    // send them to client and accept responses
    @Autowired
    CommentService commentService;

    //POST localhost:8080/api/comment
    // objekt bude v tele spravy
    @PostMapping
    public void addComment(@RequestBody Comment comment) throws CommentException {
        System.out.println(comment);
        commentService.addComment(comment);
    }

    //GET localhost:8080/api/comment/mines
    @GetMapping("/{game}")
    public List<Comment> getComments(@PathVariable String game) throws CommentException {
        return commentService.getComments(game);
    }
}
