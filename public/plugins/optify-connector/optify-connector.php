<?php
/**
 * Plugin Name: Optify Connector
 * Plugin URI:  https://optify.ai
 * Description: Securely connects your WordPress site to Optify for one-click blog publishing with full SEO support.
 * Version:     1.0.0
 * Author:      Optify
 * Author URI:  https://optify.ai
 * License:     GPL-2.0+
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Optify_Connector {

    private static $instance = null;
    const API_NAMESPACE = 'optify/v1';

    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    /**
     * Register the REST API routes.
     */
    public function register_routes() {
        register_rest_route( self::API_NAMESPACE, '/publish', array(
            'methods'  => 'POST',
            'callback' => array( $this, 'handle_publish' ),
            'permission_callback' => array( $this, 'check_permission' ),
        ) );
    }

    /**
     * Permission check: Uses Application Passwords or Standard Auth.
     * Since this is a standard REST endpoint, WordPress handles Auth headers (Basic Auth).
     * We just need to check if the user has permission to publish posts.
     */
    public function check_permission( $request ) {
        return current_user_can( 'edit_posts' );
    }

    /**
     * Handle the publish request.
     */
    public function handle_publish( $request ) {
        $params = $request->get_json_params();

        if ( empty( $params['title'] ) || empty( $params['content'] ) ) {
            return new WP_Error( 'missing_params', 'Title and Content are required', array( 'status' => 400 ) );
        }

        // 1. Create the Post
        $post_data = array(
            'post_title'    => sanitize_text_field( $params['title'] ),
            'post_content'  => $params['content'], // Assumed HTML
            'post_status'   => ! empty( $params['status'] ) ? sanitize_text_field( $params['status'] ) : 'draft',
            'post_author'   => get_current_user_id(),
            'post_type'     => 'post',
        );

        $post_id = wp_insert_post( $post_data );

        if ( is_wp_error( $post_id ) ) {
            return $post_id;
        }

        // 2. Handle SEO Metadata
        // Yoast SEO
        if ( defined( 'WPSEO_VERSION' ) ) {
            if ( ! empty( $params['meta_description'] ) ) {
                update_post_meta( $post_id, '_yoast_wpseo_metadesc', sanitize_text_field( $params['meta_description'] ) );
            }
            if ( ! empty( $params['focus_keyword'] ) ) {
                update_post_meta( $post_id, '_yoast_wpseo_focuskw', sanitize_text_field( $params['focus_keyword'] ) );
            }
        }

        // RankMath SEO
        if ( defined( 'RANK_MATH_VERSION' ) ) {
            if ( ! empty( $params['meta_description'] ) ) {
                update_post_meta( $post_id, 'rank_math_description', sanitize_text_field( $params['meta_description'] ) );
            }
            if ( ! empty( $params['focus_keyword'] ) ) {
                update_post_meta( $post_id, 'rank_math_focus_keyword', sanitize_text_field( $params['focus_keyword'] ) );
            }
        }

        // 3. Set Categories/Tags (Optional)
        if ( ! empty( $params['categories'] ) && is_array( $params['categories'] ) ) {
             wp_set_object_terms( $post_id, $params['categories'], 'category', true );
        }

        return new WP_REST_Response( array(
            'success'   => true,
            'post_id'   => $post_id,
            'permalink' => get_permalink( $post_id ),
            'edit_link' => get_edit_post_link( $post_id, 'raw' ),
        ), 200 );
    }
}

// Initialize
add_action( 'plugins_loaded', array( 'Optify_Connector', 'get_instance' ) );
