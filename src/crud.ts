import ObjectModel from "./objectModel";

export default abstract class Crud<T> {

    // #region Getters and Setters

    /**
     * The data model
     */
    public abstract get model(): ObjectModel;


    /**
     * Initialize the repository. For example,
     * creates the table on SQL based CRUDs.
     */
    public abstract setup(): Promise<void>;

    /**
     * Inserts data to the database
     * @param data The data to insert
     */
    public abstract insert(data: T): Promise<void>;

    /**
     * 
     * @param searchKeys The search keys
     */
    public abstract get(searchKeys: any): Promise<T>;

    /**
     * 
     * @param searchKeys The search keys to define the rows to be updated
     * @param dataToUpdate The data to update
     */
    public abstract update(searchKeys: any, dataToUpdate: any): Promise<void>;

    /**
     * Deletes database rows
     * @param searchKeys The search keys to delete
     */
    public abstract delete(searchKeys: any): Promise<void>;

    /**
     * Inserts each item of the data array into the database
     * @param data The data array to insert into the database
     */
    public abstract insertMultiple(data: T[]): Promise<void>;

    /**
     * Get multiple data from the database
     * @param searchKeys The keys to search
     */
    public abstract getMultiple(searchKeys: any): Promise<T[]>;


    /**
     * Returns all database data
     */
    public abstract getAll(): Promise<T[]>;

}