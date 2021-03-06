import{
    Column,
    ChildEntity,
} from 'typeorm'

import User from './User'

@ChildEntity()
export default class Association extends User{

    @Column({ nullable: false })
        name!: string
        
    @Column({ nullable: false })
        filePath!: string  
        
    @Column({ nullable: true })
        description!: string   
        
    public toJSON(): Association {
            const json: Association = Object.assign({}, this)
            delete json.password
            return json
    }
}
