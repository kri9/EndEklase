package lv.app.backend.mappers;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import lv.app.backend.dto.UserDTO;
import lv.app.backend.model.Child;
import lv.app.backend.model.User;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-05-18T20:25:00+0300",
    comments = "version: 1.6.2, compiler: javac, environment: Java 21.0.6 (Amazon.com Inc.)"
)
@Component
public class UserMapperImpl extends UserMapper {

    @Override
    public UserDTO userToDto(User user) {
        if ( user == null ) {
            return null;
        }

        UserDTO userDTO = new UserDTO();

        userDTO.setId( user.getId() );
        userDTO.setUsername( user.getUsername() );
        userDTO.setFirstName( user.getFirstName() );
        userDTO.setLastName( user.getLastName() );
        userDTO.setSeparateInvoices( user.isSeparateInvoices() );
        userDTO.setChildren( childListToUserChildDTOList( user.getChildren() ) );
        if ( user.getDiscountRate() != null ) {
            userDTO.setDiscountRate( user.getDiscountRate().intValue() );
        }

        return userDTO;
    }

    @Override
    public void updateUser(User user, UserDTO userDTO) {
        if ( userDTO == null ) {
            return;
        }

        if ( userDTO.getPassword() != null ) {
            user.setPassword( encodePassword( userDTO.getPassword() ) );
        }
        user.setId( userDTO.getId() );
        user.setUsername( userDTO.getUsername() );
        user.setFirstName( userDTO.getFirstName() );
        user.setLastName( userDTO.getLastName() );
        user.setSeparateInvoices( userDTO.isSeparateInvoices() );
        if ( userDTO.getDiscountRate() != null ) {
            user.setDiscountRate( userDTO.getDiscountRate().doubleValue() );
        }
        else {
            user.setDiscountRate( null );
        }
    }

    @Override
    public User dtoToUser(UserDTO userDTO) {
        if ( userDTO == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.password( encodePassword( userDTO.getPassword() ) );
        user.id( userDTO.getId() );
        user.username( userDTO.getUsername() );
        user.firstName( userDTO.getFirstName() );
        user.lastName( userDTO.getLastName() );
        user.separateInvoices( userDTO.isSeparateInvoices() );
        user.children( userChildDTOListToChildList( userDTO.getChildren() ) );
        if ( userDTO.getDiscountRate() != null ) {
            user.discountRate( userDTO.getDiscountRate().doubleValue() );
        }

        return user.build();
    }

    protected UserDTO.UserChildDTO childToUserChildDTO(Child child) {
        if ( child == null ) {
            return null;
        }

        long id = 0L;
        String firstname = null;
        String lastname = null;

        if ( child.getId() != null ) {
            id = child.getId();
        }
        firstname = child.getFirstname();
        lastname = child.getLastname();

        UserDTO.UserChildDTO userChildDTO = new UserDTO.UserChildDTO( id, firstname, lastname );

        return userChildDTO;
    }

    protected List<UserDTO.UserChildDTO> childListToUserChildDTOList(List<Child> list) {
        if ( list == null ) {
            return null;
        }

        List<UserDTO.UserChildDTO> list1 = new ArrayList<UserDTO.UserChildDTO>( list.size() );
        for ( Child child : list ) {
            list1.add( childToUserChildDTO( child ) );
        }

        return list1;
    }

    protected Child userChildDTOToChild(UserDTO.UserChildDTO userChildDTO) {
        if ( userChildDTO == null ) {
            return null;
        }

        Child.ChildBuilder child = Child.builder();

        child.id( userChildDTO.id() );
        child.lastname( userChildDTO.lastname() );
        child.firstname( userChildDTO.firstname() );

        return child.build();
    }

    protected List<Child> userChildDTOListToChildList(List<UserDTO.UserChildDTO> list) {
        if ( list == null ) {
            return null;
        }

        List<Child> list1 = new ArrayList<Child>( list.size() );
        for ( UserDTO.UserChildDTO userChildDTO : list ) {
            list1.add( userChildDTOToChild( userChildDTO ) );
        }

        return list1;
    }
}
